import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import SourcesList from './SourcesList';

export default function ChatMessage({ message, sources = [] }) {
  const isUser = message.role === 'user';

  return (
    <div className={`my-8 flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      <div
        className={`
          max-w-3xl w-full px-8 py-6 rounded-3xl shadow-lg backdrop-blur-sm
          ${isUser 
            ? 'bg-gold/10 border border-gold/30 text-deep' 
            : 'bg-parchment/80 border border-gold/20 text-deep'
          }
          transition-all duration-300
        `}
      >
        <div className="prose prose-lg max-w-none text-deep">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              // Custom styles for classical feel
              h1: ({ children }) => <h1 className="text-2xl font-bold font-serif mt-6 mb-4 text-gold-dark">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-bold font-serif mt-5 mb-3 text-gold-dark">{children}</h2>,
              strong: ({ children }) => <strong className="text-deep font-bold">{children}</strong>,
              em: ({ children }) => <em className="italic text-deep/90">{children}</em>,
              ul: ({ children }) => <ul className="list-disc list-inside space-y-2 my-4 ml-4">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 my-4 ml-4">{children}</ol>,
              li: ({ children }) => <li className="text-deep/90">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-gold pl-6 italic text-deep/80 my-6 py-2">
                  {children}
                </blockquote>
              ),
              code: ({ inline, children }) => 
                inline ? (
                  <code className="bg-stone/30 px-2 py-1 rounded text-deep font-medium">{children}</code>
                ) : (
                  <code className="block bg-stone/20 p-4 rounded-lg my-4 overflow-x-auto font-mono text-sm">{children}</code>
                ),
              a: ({ href, children }) => (
                <a href={href} className="text-gold-dark hover:text-gold underline transition" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              table: ({ children }) => (
                <table className="min-w-full my-6 border border-gold/30">
                  {children}
                </table>
              ),
              th: ({ children }) => <th className="border border-gold/30 px-4 py-2 bg-gold/10 text-left">{children}</th>,
              td: ({ children }) => <td className="border border-gold/30 px-4 py-2">{children}</td>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {!isUser && sources.length > 0 && <SourcesList sources={sources} />}
      </div>
    </div>
  );
}