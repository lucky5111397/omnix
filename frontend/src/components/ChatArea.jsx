import React, { useEffect } from "react";
import Navbar from "./Navbar";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useDispatch, useSelector } from "react-redux";
import getMessages from "../features/getMessages";
import { setArtifacts, setMessages } from "../redux/messageSlice";

function ChatArea() {

  const { selectedConversation } = useSelector(state => state.conversation)
  const dispatch = useDispatch()

  useEffect(() => {
    const getMesg = async () => {
      if (!selectedConversation || selectedConversation.title == "New Chat") {
        dispatch(setMessages([]))
        return;
      }

      const data = await getMessages(selectedConversation?._id)
      dispatch(setMessages(data))
      const latestArtifactMessage = [...data].reverse().find(msg => msg.artifacts && msg.artifacts.length > 0);
      dispatch(setArtifacts(latestArtifactMessage?.artifacts || []))
    }

    getMesg()
  }, [selectedConversation])

  return (
    <div className="flex-1 h-full flex flex-col min-w-0">
      <Navbar />
      <MessageList />
      <ChatInput />
    </div>
  );
}

export default ChatArea;
