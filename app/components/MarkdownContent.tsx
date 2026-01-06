'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
}

/**
 * Reusable component for rendering markdown content with consistent styling
 * Handles code blocks, headings, lists, and links with proper formatting
 */
export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="font-inter prose prose-zinc dark:prose-invert max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-a:text-primary prose-a:underline prose-a:font-normal hover:prose-a:text-primary/80">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children, ...props }) => (
            <pre className="bg-muted p-3 rounded overflow-x-auto text-sm" {...props}>
              {children}
            </pre>
          ),
          code: ({ children, className, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-muted px-1 py-0.5 rounded text-sm text-foreground" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          h1: ({ children, ...props }) => (
            <h1 className="text-lg font-bold mb-2 text-foreground" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-base font-semibold mb-2 text-foreground" {...props}>
              {children}
            </h2>
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside space-y-1 text-foreground" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside space-y-1 text-foreground" {...props}>
              {children}
            </ol>
          ),
          a: ({ children, href, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary hover:text-primary/80"
              {...props}
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
