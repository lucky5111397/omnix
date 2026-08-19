import React, { useRef, useState } from "react";
import {
  Code2,
  FileText,
  Globe,
  ImageIcon,
  MessageSquare,
  Mic,
  Paperclip,
  Presentation,
  Send,
  Zap,
  X,
} from "lucide-react";
import sendMessage from "../features/sendMessage";
import { useDispatch, useSelector } from "react-redux";
import getMessages from "../features/getMessages";
import {
  setArtifacts,
  setIsLoading,
  setMessages,
} from "../redux/messageSlice";
import { createConversation } from "../features/createConversation";
import {
  addConversation,
  setConvTitle,
  setSelectedConversation,
} from "../redux/conversationSlice";
import { updateConversation } from "../features/updateConversation";

function ChatInput() {
  const [value, setValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const [selectedFile, setSelectedFile] = useState(null);

  const fileRef = useRef(null);

  const dispatch = useDispatch();

  const { selectedConversation } = useSelector(
    (state) => state.conversation
  );

  const canSend =
    value.trim().length > 0 || selectedFile;

  const handleSendMessage = async () => {
    if (!canSend) return;

    dispatch(setIsLoading(true));

    let conversation = selectedConversation;

    try {
      if (!conversation) {
        const conv = await createConversation();

        if (!conv) {
          throw new Error("Conversation creation failed");
        }

        dispatch(setSelectedConversation(conv));
        dispatch(addConversation(conv));

        conversation = conv;
      }

      if (!conversation?._id) {
        throw new Error("No conversation selected");
      }

      const title =
        value.trim().slice(0, 40) || "File";

      if (conversation.title === "New Chat") {
        const updatedConversation =
          await updateConversation({
            id: conversation._id,
            title,
          });

        if (updatedConversation) {
          dispatch(
            setConvTitle({
              conversationId: conversation._id,
              title,
            })
          );
        }
      }

      const formData = new FormData();

      formData.append(
        "prompt",
        value.trim()
      );

      formData.append(
        "conversationId",
        conversation._id
      );

      formData.append(
        "agent",
        selectedAgent.toLowerCase()
      );

      if (selectedFile) {
        formData.append(
          "file",
          selectedFile
        );
      }

      const data =
        await sendMessage(formData);

      dispatch(
        setArtifacts(
          data?.artifacts || []
        )
      );

      const messages =
        await getMessages(
          conversation._id
        );

      dispatch(setMessages(messages));

      setValue("");
      setSelectedFile(null);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong.";

      console.error(
        "Agent Error:",
        errorMessage
      );
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const agents = [
    {
      id: "auto",
      icon: Zap,
      label: "Auto",
    },
    {
      id: "chat",
      icon: MessageSquare,
      label: "Chat",
    },
    {
      id: "coding",
      icon: Code2,
      label: "Coding",
    },
    {
      id: "pdf",
      icon: FileText,
      label: "Pdf",
    },
    {
      id: "ppt",
      icon: Presentation,
      label: "Ppt",
    },
    {
      id: "vision",
      icon: ImageIcon,
      label: "Vision",
    },
    {
      id: "search",
      icon: Globe,
      label: "Search",
    },
  ];

  return (
    <div className="relative bg-[#11141a] border border-white/[0.08] rounded-2xl px-4 pt-3 pb-12">
      <div className="flex w-[80%] gap-2 pr-2 flex-wrap">
        {agents.map((agent) => {
          const isActive =
            selectedAgent === agent.id;

          const Icon = agent.icon;

          return (
            <div
              key={agent.id}
              onClick={() =>
                setSelectedAgent(agent.id)
              }
              className={`flex-shrink-0 cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all ${isActive
                  ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,.35)]"
                  : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.07]"
                }`}
            >
              <Icon
                size={14}
                className={
                  isActive
                    ? "text-white"
                    : "text-slate-500"
                }
              />

              {agent.label}
            </div>
          );
        })}
      </div>

      {selectedFile && (
        <div className="my-3">
          <div className="relative inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2">
            {selectedFile.type ===
              "application/pdf" ? (
              <div className="flex items-center gap-2 px-2">
                <FileText
                  size={16}
                  className="text-red-400"
                />

                <span className="max-w-[180px] truncate text-xs text-slate-300">
                  {selectedFile.name}
                </span>
              </div>
            ) : selectedFile.type.startsWith(
              "image/"
            ) ? (
              <img
                src={URL.createObjectURL(
                  selectedFile
                )}
                alt={selectedFile.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : null}

            <button
              type="button"
              onClick={removeFile}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      <textarea
        placeholder="Ask Anything....."
        value={value}
        onChange={(e) =>
          setValue(e.target.value)
        }
        className="w-full h-[60px] bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-500 leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        rows={3}
      />

      <div className="absolute bottom-3 left-4 flex items-center gap-1">
        <input
          type="file"
          accept=".pdf,image/*"
          hidden
          ref={fileRef}
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() =>
            fileRef.current?.click()
          }
          className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-all cursor-pointer"
        >
          <Paperclip size={16} />
        </button>

        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-all cursor-pointer"
        >
          <Mic size={16} />
        </button>
      </div>

      <button
        disabled={!canSend}
        onClick={handleSendMessage}
        className={`absolute bottom-3 right-4 flex items-center justify-center w-8 h-8 rounded-lg border-none transition-all duration-150 ${canSend
            ? "bg-gradient-to-br from-indigo-500 to-violet-700 hover:opacity-90 text-white cursor-pointer"
            : "bg-white/[0.05] text-slate-600 cursor-not-allowed"
          }`}
      >
        <Send size={15} />
      </button>
    </div>
  );
}

export default ChatInput;