import { useEffect, useState, useRef } from "react";
import {
  Search, MoreVertical, Plus, Smile, Mic, Video, Phone, CheckCheck,
  Filter, Bell, Archive, Star, Users as UsersIcon, MessageSquare, X, ArrowUp,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from './utils/api';
import { useUI } from "./context/UIContext";

const SAMPLE_CONVOS = [];

const SAMPLE_MESSAGES = {};

import NewChatModal from "./components/NewChatModal";
import botAvatar from './assets/bot-avatar.png';

export default function Messages() {
  const [selected, setSelected] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("All");
  const [inputMessage, setInputMessage] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [ecoMessages, setEcoMessages] = useState([
    { id: 1, author: "partner", text: "Hello! I am EcoBot. How can I assist you with your waste management goals today?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [isEcoLoading, setIsEcoLoading] = useState(false);
  const scrollRef = useRef();
  const [isChatOptionsOpen, setIsChatOptionsOpen] = useState(false);
  const { showToast, confirm } = useUI();
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  const optionsRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("chats"); // "chats" or "requests"
  const emojiRef = useRef(null);

  const emojis = ['😊', '😂', '🤣', '❤️', '👍', '🙏', '🔥', '✨', '🙌', '😎', '💡', '🌱', '♻️', '🌍', '🤝', '✅', '❌', '📍', '📦', '🚛'];

  const addEmoji = (emoji) => {
    setInputMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Fetch Chats & Requests
  const fetchChats = async () => {
    try {
      const [myChatsRes, requestsRes] = await Promise.all([
        api.get('/chat/my'),
        api.get('/chat/requests')
      ]);

      const myChats = myChatsRes.data.data.map(c => ({
        ...c,
        status: 'accepted',
        unread: 0,
        online: false
      }));

      const incomingRequests = (requestsRes.data.incoming || []).map(r => {
        let displayName = r.sender.fullName || r.sender.username;
        let avatar = r.sender.volunteerDetails?.avatar || r.sender.ngoDetails?.logo;
        if (avatar && !avatar.startsWith('http') && avatar !== 'no-photo.jpg') {
          avatar = `http://localhost:5000${avatar}`;
        }
        return {
          id: r._id,
          partnerId: r.sender._id,
          title: displayName,
          avatar: avatar || `https://ui-avatars.com/api/?name=${displayName}`,
          status: 'incoming',
          unread: 1,
          time: new Date(r.createdAt).toLocaleDateString(),
          message: r.message
        };
      });

      const outgoingRequests = (requestsRes.data.outgoing || []).map(r => {
        let displayName = r.receiver.fullName || r.receiver.username;
        let avatar = r.receiver.volunteerDetails?.avatar || r.receiver.ngoDetails?.logo;
        if (avatar && !avatar.startsWith('http') && avatar !== 'no-photo.jpg') {
          avatar = `http://localhost:5000${avatar}`;
        }
        return {
          id: r._id,
          partnerId: r.receiver._id,
          title: displayName,
          avatar: avatar || `https://ui-avatars.com/api/?name=${displayName}`,
          status: 'pending',
          unread: 0,
          time: new Date(r.createdAt).toLocaleDateString(),
          message: r.message
        };
      });

      const ecobot = {
        id: 'ecobot',
        partnerId: 'ecobot',
        title: 'EcoBot Assistant',
        avatar: botAvatar,
        status: 'accepted',
        unread: 0,
        online: true,
        isBot: true,
        time: 'AI Assistant'
      };

      setConversations([ecobot, ...incomingRequests, ...outgoingRequests, ...myChats]);

      // Select EcoBot by default if none selected
      if (!selected) {
        setSelected('ecobot');
      }

    } catch (err) {
      console.error("Failed to fetch chats", err);
    }
  };

  useEffect(() => {
    fetchChats();
    // Poll for updates every 10s
    const interval = setInterval(fetchChats, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selected, messages[selected]]);

  const fetchMessages = async (partnerId, chatId) => {
    if (!partnerId) return;
    try {
      const res = await api.get(`/chat/messages/${partnerId}`);
      if (res.data.success) {
        const formattedMsgs = res.data.data.map(m => ({
          id: m._id,
          author: m.sender_id === partnerId ? "partner" : "you",
          text: m.content,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          seen: true
        }));
        // Use chatId (selected) as key for consistency
        setMessages(prev => ({ ...prev, [chatId]: formattedMsgs }));
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const handleEcoBotMessage = async (text) => {
    setIsEcoLoading(true);
    try {
      const res = await api.post('/assistant', { message: text });
      const reply = res.data?.reply || "I'm sorry, I didn't catch that.";
      setEcoMessages(prev => [...prev, {
        id: Date.now(),
        author: "partner",
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error("EcoBot error:", err);
      setEcoMessages(prev => [...prev, {
        id: Date.now(),
        author: "partner",
        text: "Sorry, I'm having trouble connecting to my AI core right now.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsEcoLoading(false);
    }
  };

  useEffect(() => {
    const chat = conversations.find(c => c.id === selected);
    if (chat && chat.status === 'accepted' && chat.partnerId) {
      fetchMessages(chat.partnerId, selected);
    }
  }, [selected, conversations]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setIsChatOptionsOpen(false);
      }
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentChat = conversations.find(c => c.id === selected);

  const handleAcceptRequest = async () => {
    try {
      await api.put(`/chat/request/${selected}`, { status: 'accepted' });

      setConversations(prev => prev.map(c =>
        c.id === selected ? { ...c, status: "accepted", unread: 0 } : c
      ));

      // Add a system welcome message
      setMessages(prev => ({
        ...prev,
        [selected]: [...(prev[selected] || []), {
          id: Date.now(),
          author: "system",
          text: "You accepted the request. You can now chat.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          seen: true
        }]
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to accept request");
    }
  };

  const handleDeclineRequest = async () => {
    try {
      await api.put(`/chat/request/${selected}`, { status: 'rejected' });
      const nextConvo = conversations.find(c => c.id !== selected);
      setConversations(prev => prev.filter(c => c.id !== selected));
      setSelected(nextConvo ? nextConvo.id : null);
    } catch (err) {
      console.error(err);
      alert("Failed to decline request");
    }
  };

  const handleSendRequest = async (user, message) => {
    try {
      // API call to send request
      const res = await api.post('/chat/request', { receiverId: user.id, message });

      // Optimistically add to list as "pending"
      const newConvo = {
        id: res.data.data._id,
        partnerId: user.id,
        title: user.name,
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name}`,
        unread: 0,
        online: false,
        status: 'pending',
        time: 'Just now'
      };

      setConversations(prev => [newConvo, ...prev]);
      setMessages(prev => ({ ...prev, [newConvo.id]: [] }));
      setSelected(newConvo.id);
      setActiveTab("requests"); // Switch to requests tab so they see it

      // Fetch to get real list
      setTimeout(fetchChats, 1000);

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Failed to send request");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selected) return;

    const chat = conversations.find(c => c.id === selected);
    if (!chat || chat.status !== 'accepted') return;

    if (chat.isBot) {
      const newMsg = {
        id: Date.now(),
        author: "you",
        text: inputMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setEcoMessages(prev => [...prev, newMsg]);
      setInputMessage("");
      handleEcoBotMessage(inputMessage);
      return;
    }

    const tempId = Date.now();
    const newMsg = {
      id: tempId,
      author: "you",
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      seen: false
    };

    setMessages(prev => ({
      ...prev,
      [selected]: [...(prev[selected] || []), newMsg]
    }));
    setInputMessage("");

    try {
      await api.post('/chat/message', {
        receiverId: chat.partnerId,
        content: inputMessage
      });
    } catch (err) {
      console.error("Transmission failed", err);
    }
  };

  const handleDeleteChat = async () => {
    if (!selected) return;
    try {
      await api.delete(`/chat/request/${selected}`);

      const nextConvo = conversations.find(c => c.id !== selected);
      setConversations(prev => prev.filter(c => c.id !== selected));
      setMessages(prev => {
        const newArgs = { ...prev };
        delete newArgs[selected];
        return newArgs;
      });
      setSelected(nextConvo ? nextConvo.id : null);
      setIsChatOptionsOpen(false);
      showToast("Chat deleted successfully", "success");
    } catch (err) {
      console.error("Failed to delete chat", err);
      showToast("Failed to delete chat", "error");
    }
  };

  const handleClearHistory = async () => {
    if (!selected) return;
    const chat = conversations.find(c => c.id === selected);
    if (!chat || !chat.partnerId) return;

    try {
      await api.delete(`/chat/messages/${chat.partnerId}`);
      setMessages(prev => ({
        ...prev,
        [selected]: []
      }));
      setIsChatOptionsOpen(false);
      showToast("Chat history cleared", "success");
    } catch (err) {
      console.error("Failed to clear history", err);
      showToast("Failed to clear history", "error");
    }
  };

  const filteredMessages = (messages[selected] || []).filter(m =>
    m.text.toLowerCase().includes(chatSearchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white text-gray-900 overflow-hidden -m-8 border border-gray-200 shadow-sm rounded-xl">
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onSendRequest={handleSendRequest}
      />
      {/* Sidebar */}
      <motion.div
        animate={{
          width: isSidebarCollapsed ? "80px" : "30%",
          minWidth: isSidebarCollapsed ? "80px" : "320px"
        }}
        className="border-r border-gray-100 flex flex-col bg-gray-50 relative transition-all duration-300"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-sm z-50 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-100 transition-all"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Tabs for sections */}
        {!isSidebarCollapsed && (
          <div className="flex px-3 pt-2 gap-1 border-b border-gray-100">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all relative ${activeTab === "chats" ? "text-emerald-700" : "text-gray-400 hover:text-gray-600"}`}
            >
              Active Chats
              {activeTab === "chats" && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all relative ${activeTab === "requests" ? "text-emerald-700" : "text-gray-400 hover:text-gray-600"}`}
            >
              Requests
              {conversations.filter(c => c.status === 'incoming' || c.status === 'pending').length > 0 && (
                <span className="ml-1 w-4 h-4 bg-emerald-100 text-emerald-800 rounded-full inline-flex items-center justify-center text-[8px]">
                  {conversations.filter(c => c.status === 'incoming' || c.status === 'pending').length}
                </span>
              )}
              {activeTab === "requests" && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />}
            </button>
          </div>
        )}

        {/* Search & New Request */}
        <div className={`p-3 mt-2 flex ${isSidebarCollapsed ? 'flex-col items-center' : 'gap-2'}`}>
          {!isSidebarCollapsed ? (
            <div className="relative flex-1 flex items-center bg-white rounded-full px-4 border border-gray-200 focus-within:ring-2 focus-within:ring-[#123524]/10 transition-all">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full h-10 bg-transparent border-none outline-none px-2 text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-2">
              <Search size={18} className="text-gray-400" />
            </div>
          )}
          <button
            onClick={() => setIsNewChatOpen(true)}
            className="w-10 h-10 rounded-full bg-[#123524] text-white flex items-center justify-center hover:bg-[#0d281a] transition-all shadow-sm shrink-0"
            title="Send New Request"
          >
            <Plus size={20} />
          </button>
        </div>



        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations
            .filter(c => {
              if (activeTab === 'chats') return c.status === 'accepted';
              if (activeTab === 'requests') return c.status === 'incoming' || c.status === 'pending';
              return true;
            })
            .filter(chat => chat.title.toLowerCase().includes(searchText.toLowerCase()))
            .map(chat => (
              <div
                key={chat.id}
                onClick={() => setSelected(chat.id)}
                className={`flex items-center gap-3 px-4 py-4 cursor-pointer transition-colors border-b border-gray-50/50 ${selected === chat.id ? "bg-white shadow-sm z-10" : "hover:bg-gray-100/50"} ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
              >
                <div className="relative shrink-0">
                  <img src={chat.avatar} alt="" className="w-12 h-12 rounded-full border border-gray-100 shadow-sm" />
                  {chat.online && <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />}
                  {isSidebarCollapsed && chat.unread > 0 && chat.status === 'accepted' && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#123524] rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">
                      {chat.unread}
                    </div>
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex-1 pb-1 truncate">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className={`text-sm tracking-tight ${selected === chat.id ? "text-[#123524] font-medium" : "text-gray-900"}`}>{chat.title}</h4>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${chat.status === 'incoming' ? 'bg-amber-100 text-amber-700' :
                        chat.status === 'pending' ? 'bg-gray-100 text-gray-500' :
                          'text-emerald-600'
                        }`}>
                        {chat.status === 'incoming' ? 'Request' : chat.status === 'pending' ? 'Pending' : chat.time || 'Online'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                        {chat.status === 'incoming' ? <span className="text-gray-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{chat.message || "Wants to connect..."}</span> :
                          chat.status === 'pending' ? <span className="text-gray-400 italic">" {chat.message} "</span> :
                            messages[chat.id]?.slice(-1)[0]?.text || "No messages yet"}
                      </p>
                      {chat.unread > 0 && chat.status === 'accepted' && (
                        <span className="w-5 h-5 bg-[#123524] rounded-full flex items-center justify-center text-[10px] text-white font-medium shadow-sm">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50/30 relative">
        {!currentChat ? (
          /* No conversations at all - show empty state */
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6 text-gray-300">
              <MessageSquare size={48} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Start a Conversation</h3>
            <p className="text-gray-500 max-w-md mb-4">
              Click the <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#123524] text-white text-sm mx-1 font-bold">+</span> button above to search for volunteers or NGOs and send them a message request.
            </p>
            <p className="text-gray-400 text-sm">
              Once they accept, you can start chatting!
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-14 px-5 flex items-center justify-between bg-white border-b border-gray-100 z-10 shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <img src={currentChat?.avatar} alt="" className="w-10 h-10 rounded-full border border-gray-100 shadow-sm" />
                <div>
                  <h4 className="font-medium text-gray-900 text-sm leading-tight tracking-tight">{currentChat?.title}</h4>
                  <p className="text-[11px] text-emerald-600">
                    {currentChat?.status === 'accepted' ? (currentChat?.online ? 'Online' : 'Offline') : 'Not Connected'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-400">
                {/* In-Chat Search Bar */}
                {isChatSearchOpen ? (
                  <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 animate-in slide-in-from-right-5 fade-in duration-200">
                    <input
                      type="text"
                      value={chatSearchQuery}
                      onChange={(e) => setChatSearchQuery(e.target.value)}
                      placeholder="Find in chat..."
                      className="bg-transparent border-none outline-none text-sm w-32 md:w-48 text-gray-700 placeholder-gray-400"
                      autoFocus
                    />
                    <X
                      size={14}
                      className="ml-2 cursor-pointer hover:text-gray-600"
                      onClick={() => {
                        setChatSearchQuery("");
                        setIsChatSearchOpen(false);
                      }}
                    />
                  </div>
                ) : (
                  <Search
                    size={18}
                    className="hover:text-[#123524] cursor-pointer transition-colors"
                    onClick={() => setIsChatSearchOpen(true)}
                  />
                )}

                <div className="relative" ref={optionsRef}>
                  <MoreVertical
                    size={18}
                    className="hover:text-[#123524] cursor-pointer transition-colors"
                    onClick={() => setIsChatOptionsOpen(!isChatOptionsOpen)}
                  />
                  <AnimatePresence>
                    {isChatOptionsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                      >
                        <button
                          onClick={handleClearHistory}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Archive size={16} /> Clear History
                        </button>
                        <button
                          onClick={handleDeleteChat}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <UsersIcon size={16} /> Delete Chat
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Messages Thread */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 z-10 custom-scrollbar flex flex-col">
              {currentChat?.status === 'incoming' ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-20 h-20 rounded-full bg-gray-100 mb-4 overflow-hidden border-4 border-white shadow-lg">
                    <img src={currentChat.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{currentChat.title} wants to chat</h3>
                  {currentChat.message && (
                    <div className="bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 italic text-emerald-800 text-sm mb-6 max-w-sm">
                      "{currentChat.message}"
                    </div>
                  )}
                  <p className="text-gray-500 max-w-xs mb-8">Accept the request to start messaging and coordinating pickups.</p>
                  <div className="flex gap-4">
                    <button
                      onClick={handleAcceptRequest}
                      className="px-8 py-3 bg-[#123524] text-white rounded-xl font-medium shadow-lg shadow-emerald-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      Accept Request
                    </button>
                    <button
                      onClick={handleDeclineRequest}
                      className="px-8 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ) : currentChat?.status === 'pending' ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 text-gray-400">
                    <UsersIcon size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Request Sent</h3>
                  <p className="text-gray-500 text-sm">Waiting for {currentChat.title} to accept your request.</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <span className="bg-white text-gray-400 px-4 py-1 shadow-sm rounded-full text-[10px] font-normal uppercase tracking-widest border border-gray-100">Today</span>
                  </div>
                  <AnimatePresence>
                    {filteredMessages.length === 0 && chatSearchQuery ? (
                      <div className="text-center text-gray-400 text-sm py-4">
                        No messages found matching "{chatSearchQuery}"
                      </div>
                    ) : filteredMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
                          <MessageSquare size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No messages yet</h3>
                        <p className="text-gray-500 text-sm">Start the conversation!</p>
                      </div>
                    ) : (currentChat.isBot ? ecoMessages : filteredMessages).map((m) => (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`flex ${m.author === 'you' ? 'justify-end' : m.author === 'system' ? 'justify-center' : 'justify-start'}`}
                      >
                        {m.author === 'system' ? (
                          <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-lg my-2">{m.text}</span>
                        ) : (
                          <div
                            className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm relative shadow-sm ${m.author === 'you'
                              ? 'bg-[#123524] text-white rounded-tr-none'
                              : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                              } ${chatSearchQuery && m.text.toLowerCase().includes(chatSearchQuery.toLowerCase()) ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}`}
                          >
                            <div className="pb-1 leading-relaxed">
                              {m.text}
                            </div>
                            <div className={`flex items-center justify-end gap-1.5 mt-1 border-t ${m.author === 'you' ? 'border-white/10' : 'border-gray-50'} pt-1`}>
                              <span className={`text-[9px] ${m.author === 'you' ? 'text-white/60' : 'text-gray-400'}`}>{m.time}</span>
                              {m.author === 'you' && m.seen && (
                                <CheckCheck size={14} className="text-emerald-400" />
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {isEcoLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>

                </>
              )}
            </div>

            {currentChat?.status === 'accepted' && (
              <div className="min-h-[70px] px-6 py-3 bg-white flex items-center gap-4 z-10 shrink-0 border-t border-gray-100">
                <div className="flex items-center gap-5 text-gray-400">
                  <div className="relative" ref={emojiRef}>
                    <Smile
                      size={22}
                      className={`hover:text-[#123524] cursor-pointer transition-colors ${showEmojiPicker ? 'text-[#123524]' : ''}`}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    />

                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute bottom-12 left-0 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 grid grid-cols-5 gap-1 z-50"
                        >
                          {emojis.map(e => (
                            <button
                              key={e}
                              onClick={() => addEmoji(e)}
                              className="w-10 h-10 flex items-center justify-center text-xl hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              {e}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <form onSubmit={sendMessage} className="flex-1">
                  <input
                    type="text"
                    placeholder="Type a message"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="w-full h-11 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 focus:bg-white focus:border-[#123524]/30 rounded-full px-5 text-gray-700 outline-none text-sm transition-all shadow-sm"
                  />
                </form>
                <div className="text-[#123524]">
                  {inputMessage.trim() ? (
                    <button
                      type="submit"
                      onClick={sendMessage}
                      className="w-10 h-10 bg-[#123524] rounded-full flex items-center justify-center text-white hover:bg-[#0d281a] transition-all shadow-md shadow-[#123524]/20"
                    >
                      <ArrowUp size={24} />
                    </button>
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 hover:text-[#123524] cursor-pointer transition-colors">
                      <Mic size={20} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>


      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(18, 53, 36, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
