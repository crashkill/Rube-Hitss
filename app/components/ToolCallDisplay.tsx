'use client';

import { useState } from 'react';

interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: unknown;
  status: 'running' | 'completed' | 'error';
}

interface ToolCallDisplayProps {
  toolCall: ToolCall;
}

export function ToolCallDisplay({ toolCall }: ToolCallDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    if (toolCall.status === 'running') {
      return (
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </div>
      );
    }
    if (toolCall.status === 'completed') {
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  };

  return (
    <div className="glass-card rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 overflow-hidden my-3 max-w-2xl transition-all duration-200 hover:shadow-md">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-white/50 dark:bg-neutral-900/50 hover:bg-white/80 dark:hover:bg-neutral-900/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800">
            {getStatusIcon()}
          </div>
          <div className="flex flex-col items-start">
            <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 font-mono">
              {toolCall.name}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {toolCall.status === 'running' ? 'Executing...' :
                toolCall.status === 'completed' ? 'Completed' : 'Failed'}
            </span>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-3 bg-neutral-50/50 dark:bg-neutral-950/30 border-t border-neutral-200/50 dark:border-neutral-800/50 text-xs font-mono">
          {/* Input Arguments */}
          <div className="mb-3">
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Input</div>
            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-2 overflow-x-auto">
              <pre className="text-neutral-700 dark:text-neutral-300">
                {JSON.stringify(toolCall.input, null, 2)}
              </pre>
            </div>
          </div>

          {/* Output Result */}
          {toolCall.output !== undefined && (
            <div>
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Output</div>
              <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-2 overflow-x-auto max-h-64 overflow-y-auto custom-scrollbar">
                <pre className="text-neutral-700 dark:text-neutral-300">
                  {typeof toolCall.output === 'string'
                    ? toolCall.output
                    : JSON.stringify(toolCall.output, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
