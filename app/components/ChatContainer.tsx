'use client';

import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { User } from '@supabase/supabase-js';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChatMessages } from './ChatMessages';
import { ChatWelcome } from './ChatWelcome';
import { MessageInput } from './MessageInput';
import { useConversations } from '@/app/hooks/useConversations';

interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: unknown;
  status: 'running' | 'completed' | 'error';
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  toolCalls?: ToolCall[];
}

interface ChatContainerProps {
  user?: User;
}

export function ChatContainer({ user: _user }: ChatContainerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingToolCalls, setStreamingToolCalls] = useState<ToolCall[]>([]);

  const { loadConversations } = useConversations();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Handle auto-connection from Apps page
  useEffect(() => {
    const connectApp = searchParams.get('connectApp');
    const appName = searchParams.get('appName');

    if (connectApp && appName) {
      const message = `Connect my ${appName} account`;
      handleSendMessage(message);

      // Clean up URL params
      router.replace('/?tab=chat');
    }
  }, [searchParams]);

  const loadConversationMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      if (response.ok) {
        const data = await response.json();
        interface ApiMessage {
          id: string;
          content: string;
          role: string;
          created_at: string;
        }
        const formattedMessages = (data.messages as ApiMessage[]).map((msg: ApiMessage) => {
          const sender: 'user' | 'assistant' = msg.role === 'user' ? 'user' : 'assistant';
          return {
            id: msg.id,
            content: msg.content,
            sender,
            timestamp: new Date(msg.created_at)
          };
        });
        setMessages(formattedMessages);
        setCurrentConversationId(conversationId);
      }
    } catch (error) {
      console.error('Error loading conversation messages:', error);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setInputValue('');
  };

  const handleOAuthInputSubmit = async (values: Record<string, string>) => {
    // Send the collected values back as a message to continue the flow
    const inputSummary = Object.entries(values)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    await handleSendMessage(`I've provided the following inputs: ${inputSummary}. Please proceed with the connection.`);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: nanoid(),
      content: message.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setStreamingContent('');

    try {
      const chatMessages = [...messages, userMessage].map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatMessages,
          conversationId: currentConversationId
        }),
      });

      if (!chatResponse.ok) {
        throw new Error(`Chat API error: ${chatResponse.status}`);
      }

      const newConversationId = chatResponse.headers.get('X-Conversation-Id');
      if (!currentConversationId && newConversationId) {
        setCurrentConversationId(newConversationId);
        loadConversations();
      }

      const reader = chatResponse.body?.getReader();
      const decoder = new TextDecoder();

      let fullContent = '';
      const toolCallsMap = new Map<string, ToolCall>();
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data: ')) continue;

            const data = line.slice(6); // Remove 'data: ' prefix
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);

              // Handle text deltas
              if (parsed.type === 'text-delta') {
                fullContent += parsed.delta || '';
                setStreamingContent(fullContent);
              }

              // Handle tool input start
              if (parsed.type === 'tool-input-start') {
                console.log('🚀 tool-input-start event:', parsed);
                const toolCall: ToolCall = {
                  id: parsed.toolCallId,
                  name: parsed.toolName,
                  input: {},
                  status: 'running'
                };
                console.log('🚀 Created tool call:', toolCall);
                toolCallsMap.set(parsed.toolCallId, toolCall);
                setStreamingToolCalls(Array.from(toolCallsMap.values()));
              }

              // Handle tool input available (complete arguments)
              if (parsed.type === 'tool-input-available') {
                const existingTool = toolCallsMap.get(parsed.toolCallId);
                if (existingTool) {
                  existingTool.input = parsed.input || {};
                  toolCallsMap.set(parsed.toolCallId, existingTool);
                  setStreamingToolCalls(Array.from(toolCallsMap.values()));
                }
              }

              // Handle tool output available
              if (parsed.type === 'tool-output-available') {
                const existingTool = toolCallsMap.get(parsed.toolCallId);
                if (existingTool) {
                  existingTool.output = parsed.output;
                  existingTool.status = 'completed';
                  toolCallsMap.set(parsed.toolCallId, existingTool);
                  setStreamingToolCalls(Array.from(toolCallsMap.values()));
                }
              }
            } catch (e) {
              console.error('Error parsing stream data:', e, 'Line:', line);
            }
          }
        }
      }

      const assistantMessage: Message = {
        id: nanoid(),
        content: fullContent || 'Sorry, I could not process your request.',
        sender: 'assistant',
        timestamp: new Date(),
        toolCalls: Array.from(toolCallsMap.values())
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingContent('');
      setStreamingToolCalls([]);
    } catch (error) {
      console.error('Error calling chat API:', error);

      const errorMessage: Message = {
        id: nanoid(),
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      setStreamingContent('');
    } finally {
      setIsLoading(false);
    }
  };

  const showWelcomeScreen = messages.length === 0 && !isLoading;

  return (
    <div className="flex-1 flex relative h-full bg-[#FBFAF9] dark:bg-neutral-900 transition-colors duration-200">
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full">

        {/* Welcome screen or chat messages */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {showWelcomeScreen ? (
            <ChatWelcome
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          ) : (
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              streamingContent={streamingContent}
              streamingToolCalls={streamingToolCalls}
              onOAuthInputSubmit={handleOAuthInputSubmit}
            />
          )}
        </div>

        {/* Input bar at bottom - only show when not on welcome screen */}
        {!showWelcomeScreen && (
          <div className="p-3 sm:p-4 bg-[#fcfaf9] dark:bg-neutral-900 transition-colors duration-200">
            <div className="max-w-3xl mx-auto">
              <MessageInput
                value={inputValue}
                onChange={setInputValue}
                onSendMessage={handleSendMessage}
                placeholder="Send a message..."
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
