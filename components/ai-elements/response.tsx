"use client";

import { cn } from "@/lib/utils";
import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";
import { CodeBlock } from "@/components/discover/RichContent";

type ResponseProps = ComponentProps<typeof Streamdown> & {
  components?: Record<string, any>;
};

export const Response = memo(
  ({ className, components, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
      components={{
        // Custom code block rendering with copy/download buttons
        code: ({ className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : undefined;

          // Inline code
          if (!language) {
            return (
              <code className={cn("px-1 py-0.5 rounded bg-muted text-sm font-mono", className)} {...props}>
                {children}
              </code>
            );
          }

          // Code block
          return (
            <CodeBlock
              code={String(children).replace(/\n$/, '')}
              language={language}
              showLineNumbers={false}
            />
          );
        },
        // Override with custom components if provided
        ...components,
      }}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
