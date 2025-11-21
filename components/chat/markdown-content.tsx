import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

interface MarkdownContentProps {
  content: string;
  isUser?: boolean;
}

export function MarkdownContent({ content, isUser = false }: MarkdownContentProps) {
  return (
    <div className="prose prose-sm max-w-none prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
        // Estilos personalizados para los elementos
        p: ({ children }) => <p className="mb-2 last:mb-0 text-white">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 ml-4 list-disc text-white">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal text-white">{children}</ol>,
        li: ({ children }) => <li className="mb-1 text-white">{children}</li>,
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          return isInline ? (
            <code
              className={`px-1.5 py-0.5 rounded text-sm font-mono ${
                isUser ? 'bg-white/30 text-white' : 'bg-white/20 text-white'
              }`}
              {...props}
            >
              {children}
            </code>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="mb-2 p-3 rounded-lg overflow-x-auto bg-black/40 text-gray-100 border border-white/10">
            {children}
          </pre>
        ),
        h1: ({ children }) => <h1 className="text-xl font-bold mb-2 text-white">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-white">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-bold mb-2 text-white">{children}</h3>,
        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
        em: ({ children }) => <em className="italic text-white">{children}</em>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 pl-3 italic mb-2 border-primary/50 text-gray-300">
            {children}
          </blockquote>
        ),
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-primary hover:text-primary/80"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse border border-white/20">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-white/10">
            {children}
          </thead>
        ),
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => (
          <tr className="border-b border-white/10">
            {children}
          </tr>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 text-left font-semibold text-sm text-white">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 text-sm text-white/90">
            {children}
          </td>
        ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
