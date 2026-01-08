import { NextRequest, NextResponse } from "next/server";
export const runtime = 'nodejs';
import { streamText, stepCountIs, tool, Tool } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { experimental_createMCPClient as createMCPClient } from '@ai-sdk/mcp';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createClient } from '@/app/utils/supabase/server';
import { z } from 'zod';
import {
  createConversation,
  addMessage,
  generateConversationTitle
} from '@/app/utils/chat-history';
import { getComposio } from "@/app/utils/composio";
import { logger } from '@/app/utils/logger';
import * as fs from 'fs';
import * as path from 'path';

type ToolsRecord = Record<string, Tool>;

interface MCPSessionCache {
  session: { url: string; sessionId: string };
  client: Awaited<ReturnType<typeof createMCPClient>>;
  tools: ToolsRecord;
}

// Session cache to store MCP sessions per chat session per user
const sessionCache = new Map<string, MCPSessionCache>();

function logDebug(message: string, data?: any) {
  try {
    const logPath = path.join(process.cwd(), 'test_log.txt');
    const timestamp = new Date().toISOString();
    const dataStr = data ? JSON.stringify(data, null, 2) : '';
    fs.appendFileSync(logPath, `[${timestamp}] ${message} ${dataStr}\n`);
    console.log(`[DEBUG] ${message}`, data || '');
  } catch (e) {
    console.error('Failed to log', e);
  }
}


export async function POST(request: NextRequest) {
  logDebug('POST /api/chat started');

  // Create OpenAI client with custom configuration
  const openai = createOpenAI({
    baseURL: process.env.OPENAI_BASE_URL,
    apiKey: process.env.OPENAI_API_KEY,
  });


  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      logDebug('Failed to parse JSON body', e);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { messages, conversationId } = body;

    if (!messages) {
      return NextResponse.json(
        { error: 'messages is required' },
        { status: 400 }
      );
    }

    // Get authenticated user from server-side session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logDebug('Auth error or no user', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const userEmail = user.email;
    if (!userEmail) {
      logDebug('User has no email');
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    logDebug('User authenticated', { userId: user.id, email: userEmail });

    const missingEnv: string[] = [];
    if (!process.env.OPENAI_API_KEY) missingEnv.push('OPENAI_API_KEY');
    if (!process.env.COMPOSIO_API_KEY) missingEnv.push('COMPOSIO_API_KEY');
    if (missingEnv.length > 0) {
      logDebug('Missing env vars', missingEnv);
      return NextResponse.json(
        { error: `Missing environment variables: ${missingEnv.join(', ')}` },
        { status: 500 }
      );
    }

    let currentConversationId = conversationId;
    const latestMessage = messages[messages.length - 1];
    const isFirstMessage = !conversationId;

    // Create new conversation if this is the first message
    if (isFirstMessage) {
      const title = generateConversationTitle(latestMessage.content);
      currentConversationId = await createConversation(user.id, title);

      if (!currentConversationId) {
        logDebug('Failed to create conversation');
        return NextResponse.json(
          { error: 'Failed to create conversation' },
          { status: 500 }
        );
      }
    }

    // Save user message to database
    await addMessage(
      currentConversationId,
      user.id,
      latestMessage.content,
      'user'
    );

    logDebug('Conversation setup done', { conversationId: currentConversationId });

    // Create a unique session key based on user and conversation
    const sessionKey = `${user.id}-${currentConversationId}`;

    let mcpClient: any = null; // Explicitly init to null
    let tools: ToolsRecord = {};
    let mcpSession: any = null;

    logDebug('Initializing Composio');
    const composio = getComposio();

    // Fetch active connections to correctly populate toolkits
    logDebug('Fetching connections');
    const connectedAccounts = await composio.connectedAccounts.list({
      userIds: [userEmail]
    });

    logDebug('Connections fetched', { count: connectedAccounts.items?.length });

    // Extract unique toolkit slugs from active connections
    const connectedToolkits = Array.from(new Set(
      (connectedAccounts.items || [])
        .filter(acc => acc.status === 'ACTIVE' && acc.toolkit)
        .map(acc => acc.toolkit!.slug)
    ));

    logDebug('Active toolkits', connectedToolkits);

    // Access the experimental ToolRouter for specific toolkits
    try {
      logDebug('Creating ToolRouter session');
      mcpSession = await composio.experimental.toolRouter.createSession(userEmail, {
        toolkits: connectedToolkits.length > 0 ? connectedToolkits : []
      });

      const urlString = mcpSession.url;
      const sessId = mcpSession.sessionId;
      logDebug('MCP session created', { sessionId: sessId, url: urlString });

      const url = new URL(urlString);

      logDebug('Creating MCP Client');
      mcpClient = await createMCPClient({
        transport: new StreamableHTTPClientTransport(url, {
          sessionId: sessId,
        }),
      });
      logDebug('MCP Client created');
    } catch (e: any) {
      logDebug('Composio/MCP Session Creation Failed', { message: e.message, stack: e.stack });
      throw e;
    }

    logDebug('Fetching tools from MCP client');
    const mcpTools = await mcpClient.tools();
    logDebug('Tools fetched', { count: Object.keys(mcpTools).length });

    // Add custom tools to override/augment MCP behavior
    tools = {
      ...mcpTools,

      // ✅ CUSTOM TOOL: Rube Manage Connections
      // This forces the AI to check connections via our direct API call instead of the generic tool
      RUBE_MANAGE_CONNECTIONS: tool({
        description: 'Check which applications are currently connected and active for the user. ALWAYS use this instead of generic connection tools.',
        // Use parameters as standard for ai sdk
        parameters: z.object({}),
        execute: async () => {
          try {
            logDebug('Executing RUBE_MANAGE_CONNECTIONS');

            // Fetch verified connections using the email that works
            const accounts = await composio.connectedAccounts.list({
              userIds: [userEmail]
            });

            const connectedApps = (accounts.items || [])
              .filter(acc => acc.status === 'ACTIVE')
              .map(acc => ({
                appName: acc.toolkit?.slug || 'unknown',
                status: acc.status,
                connectedAt: acc.createdAt
              }));

            logDebug('Custom tool connections result', connectedApps);

            if (connectedApps.length === 0) {
              return "No active applications connected. Please ask the user to connect their apps (Gmail, Outlook, etc).";
            }

            return `Active Connections Found:\n${connectedApps.map(app => `- ${app.appName} (Status: ${app.status})`).join('\n')}\n\nYou can proceed to use tools for these apps immediately.`;
          } catch (error: any) {
            logDebug('Error in RUBE_MANAGE_CONNECTIONS', error);
            return "Error checking connections. Assume no apps are connected.";
          }
        }
      }),

      REQUEST_USER_INPUT: tool({
        description: 'Request custom input fields from the user BEFORE starting OAuth flow. Use ONLY when a service requires additional parameters beyond standard OAuth (e.g., Pipedrive subdomain, Salesforce instance URL, custom API endpoint). DO NOT use for services that only need standard OAuth authorization.',
        parameters: z.object({
          provider: z.string().describe('The name of the service/provider (e.g., "pipedrive", "salesforce")'),
          fields: z.array(z.object({
            name: z.string().describe('Field name (e.g., "subdomain")'),
            label: z.string().describe('User-friendly label (e.g., "Company Subdomain")'),
            type: z.string().optional().describe('Input type (text, email, password, etc.)'),
            required: z.boolean().optional().describe('Whether this field is required'),
            placeholder: z.string().optional().describe('Placeholder text for the input')
          })).describe('List of input fields to request from the user'),
          authConfigId: z.string().optional().describe('The auth config ID to use after collecting inputs'),
          logoUrl: z.string().optional().describe('URL to the provider logo/icon')
        }),
        execute: async ({ provider, fields, authConfigId, logoUrl }: { provider: string, fields: any[], authConfigId?: string, logoUrl?: string }) => {
          // Return a special marker that the frontend will detect
          return {
            type: 'user_input_request',
            provider,
            fields,
            authConfigId,
            logoUrl,
            message: `Requesting user input for ${provider}`
          };
        }
      })
    };

    // Cache the session, client, and tools for this chat
    if (mcpSession && mcpClient) {
      sessionCache.set(sessionKey, { session: mcpSession, client: mcpClient, tools });
    }

    // Log the configuration being used
    logDebug('Using AI Configuration', {
      model: process.env.AI_MODEL || 'gpt-4.1',
      baseUrl: process.env.OPENAI_BASE_URL || 'default',
    });

    logDebug('Starting streamText');
    const result = await streamText({
      model: openai(process.env.AI_MODEL || 'gpt-4.1'),
      tools,
      system: `You are a helpful AI assistant called Rube that can interact with 500+ applications through Composio's Tool Router.

            When responding to users:
            - Always format your responses using Markdown syntax
            - Use **bold** for emphasis and important points
            - Use bullet points and numbered lists for clarity
            - Format links as [text](url) so they are clickable
            - Use code blocks with \`\`\` for code snippets
            - Use inline code with \` for commands, file names, and technical terms
            - Use headings (##, ###) to organize longer responses
            - Make your responses clear, concise, and well-structured

            When executing actions:
            - Explain what you're doing before using tools
            - Provide clear feedback about the results
            - Include relevant links when appropriate

            CRITICAL - Automatic Tool Discovery & Execution:
            - When a user requests an action (e.g., "list my emails", "create calendar event"), IMMEDIATELY and AUTOMATICALLY:
              1. Call RUBE_SEARCH_TOOLS to find relevant tools for that action
              2. Call RUBE_MANAGE_CONNECTIONS to check which apps are connected
              3. If a tool exists AND its app is ACTIVE, USE IT IMMEDIATELY without asking the user
              4. NEVER ask "which service would you like to use?" if only ONE service is connected
              5. Only ask for clarification if MULTIPLE services are connected (e.g., both Gmail and Outlook)
            
            - Example for "Liste meus últimos 5 emails":
              Step 1: Call RUBE_SEARCH_TOOLS("gmail list emails") → Find GMAIL_LIST_MESSAGES tool
              Step 2: Call RUBE_MANAGE_CONNECTIONS() → Verify Gmail is ACTIVE
              Step 3: If ACTIVE → IMMEDIATELY call GMAIL_LIST_MESSAGES
              Step 4: Return results to user
              WRONG: Asking "Qual serviço de e-mail você gostaria de usar?"
              RIGHT: Automatically using Gmail since it's the only connected email service

            CRITICAL - Connection Verification:
            - BEFORE asking the user to connect any app, ALWAYS use RUBE_MANAGE_CONNECTIONS to check if the app is already connected
            - If the connection status shows ACTIVE, DO NOT ask the user to connect again - just proceed with their request
            - Only ask to connect if the app is NOT in the connected accounts list
            - Common mistake: Assuming an app needs connection without checking first

            CRITICAL - Source of Truth:
            - For ANY information about connections, toolkits, or app integrations, ALWAYS rely on tool calls
            - Tool call results are the ONLY source of truth - do not rely on memory or assumptions
            - If you need to know about connection status, available tools, or app capabilities, call the relevant tool
            - Examples: Use RUBE_SEARCH_TOOLS to find available tools, RUBE_MANAGE_CONNECTIONS to check connection status
            - Never assume a connection exists or tools are available without checking via tool calls

            IMPORTANT - Custom Input Fields:
            - Some services require additional parameters BEFORE OAuth (e.g., Pipedrive needs company subdomain, Salesforce needs instance URL)
            - When connecting to these services, you MUST use the REQUEST_USER_INPUT tool FIRST to collect required fields
            - Examples that need REQUEST_USER_INPUT: Pipedrive (subdomain), Salesforce (instance URL), custom API endpoints
            - Examples that DON'T need it: Gmail, Slack, GitHub (standard OAuth only)
            - After collecting inputs via REQUEST_USER_INPUT, the user will provide the values, then you can proceed with RUBE_MANAGE_CONNECTIONS

            Always prefer to authenticate with Composio Managed Authentication unless explicitly requested otherwise.
          `,
      messages: messages,
      stopWhen: stepCountIs(50),
      onStepFinish: () => {
        logDebug('AI step completed');
      },
      onFinish: async (event) => {
        // Save assistant response to database when streaming finishes
        try {
          const result = await addMessage(
            currentConversationId,
            user.id,
            event.text,
            'assistant'
          );

          if (!result) {
            logDebug('Failed to save assistant message');
          } else {
            logDebug('Assistant message saved');
          }
        } catch (error) {
          logDebug('Error saving assistant message', error);
        }
      },
    });

    // Return streaming response with tool call data
    return result.toUIMessageStreamResponse({
      headers: {
        'X-Conversation-Id': currentConversationId,
      },
    });
  } catch (error: any) {
    logDebug('GLOBAL API ERROR LOG', { message: error.message, stack: error.stack });

    // Return detailed error for debugging
    return NextResponse.json(
      {
        error: 'Failed to process chat request',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}