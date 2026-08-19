import { Code, ExternalLink, Copy, Check } from "lucide-react";
import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

function MessageBubble({ role, content, images }) {
  const isUser = role === "user";
  const [lightBox, setLightBox] = useState(null);
  const [copiedCode, setCopiedCode] = useState("");

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);

      setCopiedCode(code);

      setTimeout(() => {
        setCopiedCode("");
      }, 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <>
      <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed ${isUser
              ? "bg-gradient-to-br from-indigo-500 to-violet-700 text-white rounded-tr-sm"
              : "text-slate-200 rounded-tl-sm"
            }`}
        >
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mt-5 mb-3">
                  {children}
                </h1>
              ),

              h2: ({ children }) => (
                <h2 className="text-xl font-semibold mt-4 mb-2">
                  {children}
                </h2>
              ),

              h3: ({ children }) => (
                <h3 className="text-lg font-semibold mt-3 mb-2">
                  {children}
                </h3>
              ),

              p: ({ children }) => (
                <p className="mb-3 whitespace-pre-wrap break-words">
                  {children}
                </p>
              ),

              ul: ({ children }) => (
                <ul className="list-disc pl-5 space-y-1 my-2">
                  {children}
                </ul>
              ),

              ol: ({ children }) => (
                <ol className="list-decimal pl-5 space-y-1 my-2">
                  {children}
                </ol>
              ),

              li: ({ children }) => (
                <li className="mb-1">
                  {children}
                </li>
              ),

              strong: ({ children }) => (
                <strong className="font-semibold text-white">
                  {children}
                </strong>
              ),

              table: ({ children }) => (
                <div className="my-4 overflow-x-auto rounded-lg border border-slate-700">
                  <table className="w-full text-left text-sm text-slate-300">
                    {children}
                  </table>
                </div>
              ),

              thead: ({ children }) => (
                <thead className="bg-slate-800 text-slate-100">
                  {children}
                </thead>
              ),

              tbody: ({ children }) => (
                <tbody className="divide-y divide-slate-800">
                  {children}
                </tbody>
              ),

              tr: ({ children }) => (
                <tr className="hover:bg-slate-800/50 transition">
                  {children}
                </tr>
              ),

              th: ({ children }) => (
                <th className="px-4 py-3 font-semibold border-b border-slate-700">
                  {children}
                </th>
              ),

              td: ({ children }) => (
                <td className="px-4 py-3 border-r border-slate-800 last:border-r-0">
                  {children}
                </td>
              ),

              code: ({ children, className, node, ...props }) => {
                const match = /language-(\w+)/.exec(className || "");
                const codeText = String(children).replace(/\n$/, "");
                const isBlock = !!match || codeText.includes("\n");

                if (isBlock) {
                  return (
                    <div className="relative my-4 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                      <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Code size={14} />
                          <span>{match?.[1] || "code"}</span>
                        </div>

                        <button
                          onClick={() => copyCode(codeText)}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
                        >
                          {copiedCode === codeText ? (
                            <>
                              <Check size={14} />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="p-4 overflow-x-auto text-[12.5px] leading-relaxed">
                        <code
                          className="font-mono text-violet-300"
                          {...props}
                        >
                          {children}
                        </code>
                      </pre>
                    </div>
                  );
                }

                return (
                  <code
                    className="px-1.5 py-0.5 rounded-md bg-slate-800 text-violet-300 font-mono text-[12.5px]"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },

              a: ({ children, href }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 underline underline-offset-2"
                >
                  {children}
                  <ExternalLink size={14} />
                </a>
              ),
            }}
          >
            {content}
          </Markdown>

          {Array.isArray(images) && images.length > 0 && (
            <div className="mt-3 grid gap-2">
              {images.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt="Search result"
                  onClick={() => setLightBox(image)}
                  className="cursor-pointer rounded-lg max-w-full hover:opacity-90 transition"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {lightBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <button
            onClick={() => setLightBox(null)}
            className="absolute top-5 right-5 z-50 w-10 h-10 rounded-full bg-black/70 text-white text-2xl flex items-center justify-center hover:bg-black transition"
          >
            ×
          </button>

          <img
            src={lightBox}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export default MessageBubble;