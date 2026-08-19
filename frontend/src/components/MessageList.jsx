import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import MessageBubble from "./MessageBubble";
import LoadingAnimation from "./LoadingAnimation";

function MessageList() {
    const { selectedConversation } = useSelector(
        (state) => state.conversation
    );

    const { messages, isLoading } = useSelector(
        (state) => state.message
    );

    const bottomRef = useRef(null);

    useEffect(() => {
        requestAnimationFrame(() => {
            bottomRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "end",
            });
        });
    }, [messages?.length, isLoading]);

    return (
        <div className="flex-1 flex flex-col overflow-y-auto px-6 py-6 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {messages.length === 0 || !selectedConversation ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="flex flex-col gap-1.5">
                        <h1 className="text-[20px] font-semibold text-slate-200 tracking-tight">
                            Omnix
                        </h1>

                        <p className="text-[15px] font-semibold text-slate-400 tracking-tight">
                            How Can I Help You
                        </p>

                        <p className="text-[13px] text-slate-600 max-w-[260px] leading-relaxed">
                            Ask me anything - code, ideas, explanations, or just a quick question.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 mt-1">
                        {[
                            "Write a Netflix Clone",
                            "Explain Redis",
                            "Build a dashboard",
                        ].map((s) => (
                            <button
                                key={s}
                                className="text-[12px] text-slate-400 bg-white/[0.06] border border-white/[0.07] px-3 py-1.5 rounded-lg hover:bg-white/[0.08] hover:text-slate-200 transition-colors duration-150 cursor-pointer"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    {messages.map((msg) => (
                        <div
                            key={
                                msg._id ??
                                msg.id ??
                                `${msg.role}-${msg.createdAt}-${msg.content}`
                            }
                        >
                            <MessageBubble
                                role={msg?.role}
                                content={msg?.content}
                                images={msg?.images}
                            />
                        </div>
                    ))}

                    {isLoading && <LoadingAnimation />}
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    );
}

export default MessageList;