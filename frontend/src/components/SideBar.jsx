import React, { useEffect, useState } from "react";
import {
  Coins,
  LogOut,
  Menu,
  MessageSquare,
  PanelLeftIcon,
  PanelRightIcon,
  PenSquare,
  Plus,
  User,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getConversations } from "../features/getCoversation";
import { createConversation } from "../features/createConversation";
import logOut from "../features/logOut";
import {
  addConversation,
  setConversations,
  setSelectedConversation,
} from "../redux/conversationSlice";
import { setUser } from "../redux/userSlice";
import BillingDrawer from "./BillingDrawer";

function SideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showBilling, setShowBilling] = useState(false);

  const dispatch = useDispatch();

  const { conversations = [], selectedConversation } = useSelector(
    (state) => state.conversation
  );

  const { user } = useSelector((state) => state.user);

  const userPlan = user?.plan || user?.subscriptionPlan || "Free";

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await getConversations();

        dispatch(setConversations(data || []));

        if (data?.length) {
          dispatch(setSelectedConversation(data[0]));
          return;
        }

        const conversation = await createConversation();

        if (conversation) {
          dispatch(addConversation(conversation));
          dispatch(setSelectedConversation(conversation));
        }
      } catch (error) {
        console.error("Failed to load conversations:", error);
      }
    };

    loadConversations();
  }, [dispatch]);

  const handleCreateConversation = async () => {
    try {
      const conversation = await createConversation();

      if (!conversation) return;

      dispatch(addConversation(conversation));
      dispatch(setSelectedConversation(conversation));
      setMobileOpen(false);
    } catch (error) {
      console.error("Create conversation error:", error);
    }
  };

  const handleSelectConversation = (conversation) => {
    dispatch(setSelectedConversation(conversation));
    setMobileOpen(false);
  };

  const handleNewChat = () => {
    dispatch(setSelectedConversation(null));
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(setUser(null));
    }
  };

  const renderAvatar = () => {
    const avatar = user?.avatar || user?.photoURL;

    if (avatar && !imageError) {
      return (
        <img
          src={avatar}
          alt="User"
          className="w-9 h-9 rounded-[10px] object-cover border-2 border-indigo-500/20"
          onError={() => setImageError(true)}
        />
      );
    }

    return (
      <div className="w-9 h-9 rounded-[10px] bg-white/[0.06] flex items-center justify-center">
        <User size={14} className="text-slate-400" />
      </div>
    );
  };

  const renderConversation = (conversation, collapsedView = false) => {
    const isActive =
      selectedConversation?._id === conversation?._id;

    return (
      <div
        key={conversation?._id ?? conversation?.id}
        onClick={() => handleSelectConversation(conversation)}
        className={`flex items-center gap-2.5 cursor-pointer mb-0.5 px-3 py-2.5 rounded-[10px] border transition-colors duration-150 ${isActive
            ? "bg-indigo-500/10 border-indigo-500/20"
            : "bg-transparent border-transparent"
          }`}
      >
        <div
          className={`flex items-center justify-center shrink-0 rounded-lg transition-colors duration-150 ${collapsedView ? "w-[20px] h-[20px]" : "w-[28px] h-[28px]"
            } ${isActive
              ? "bg-indigo-500/15 text-indigo-400"
              : "bg-white/[0.05] text-slate-400"
            }`}
        >
          <MessageSquare size={13} />
        </div>

        {!collapsedView && (
          <span
            className={`text-[13px] font-medium truncate ${isActive ? "text-slate-100" : "text-slate-300"
              }`}
          >
            {conversation?.title || "New Chat"}
          </span>
        )}
      </div>
    );
  };

  if (collapsed) {
    return (
      <div className="hidden lg:flex flex-col items-center w-[56px] h-screen bg-[#0d0f14] border-r border-white/[0.06] py-4 gap-1 shrink-0">
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors bg-transparent border-none cursor-pointer mb-1"
        >
          <PanelRightIcon />
        </button>

        <button
          onClick={handleNewChat}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors bg-transparent border-none cursor-pointer"
        >
          <Plus size={17} />
        </button>

        <div className="flex-1 w-full overflow-y-auto px-2.5 pb-2 pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {conversations.map((conversation) =>
            renderConversation(conversation, true)
          )}
        </div>

        <div className="relative shrink-0">
          {renderAvatar()}
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-[60] flex items-center justify-center w-8 h-8 rounded-lg bg-[#0d0f14] border border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors cursor-pointer"
      >
        <Menu size={14} />
      </button>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[270px] h-screen shrink-0 bg-[#0d0f14] border-r border-white/[0.06] transition-transform duration-250 ${mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.06]">
            <button
              onClick={() => setCollapsed(true)}
              className="hidden lg:flex items-center justify-center w-7 h-7 text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors bg-transparent border-none cursor-pointer"
            >
              <PanelLeftIcon />
            </button>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors bg-transparent border-none cursor-pointer"
            >
              <X size={18} />
            </button>

            <span className="text-[16px] font-semibold text-slate-100 tracking-tight flex-1">
              Omnix
            </span>

            <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full tracking-wide capitalize">
              {userPlan}
            </span>

            <button
              onClick={handleNewChat}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors bg-transparent border-none cursor-pointer"
            >
              <PenSquare size={14} />
            </button>
          </div>

          <div className="px-4 pt-4 pb-1">
            <button
              onClick={handleCreateConversation}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-gradient-to-br from-indigo-500 to-violet-700 rounded-xl py-[10px] border-none cursor-pointer hover:opacity-90 transition-opacity"
            >
              <Plus size={15} />
              New Chat
            </button>
          </div>

          <div className="px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-600">
            {conversations.length
              ? "Recents"
              : "No Recent Conversations"}
          </div>

          <div className="flex-1 overflow-y-auto px-2.5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {conversations.map((conversation) =>
              renderConversation(conversation)
            )}
          </div>

          <div className="mx-2.5 h-px bg-white/[0.06]" />

          <div className="px-3.5 py-3.5">
            {user ? (
              <div className="flex items-center gap-2.5 rounded-xl">
                <div className="relative shrink-0">
                  {renderAvatar()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold text-slate-100 truncate">
                    {user?.name || user?.displayName || "User"}
                  </p>

                  <p className="text-[11px] text-slate-600 mt-px capitalize">
                    {userPlan} Plan
                  </p>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => setShowBilling(true)}
                    className="flex items-center justify-center w-7 h-7 rounded-[7px] bg-transparent text-yellow-600 border-none cursor-pointer hover:bg-white/[0.08] hover:text-slate-400 transition-all"
                  >
                    <Coins size={16} />
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-7 h-7 rounded-[7px] bg-transparent text-yellow-600 border-none cursor-pointer hover:bg-white/[0.08] hover:text-slate-400 transition-all"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button>Login</button>
            )}
          </div>
        </div>
      </aside>

      <BillingDrawer
        open={showBilling}
        onClose={() => setShowBilling(false)}
      />
    </>
  );
}

export default SideBar;