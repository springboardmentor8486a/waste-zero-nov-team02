import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minus, RefreshCw, Zap } from 'lucide-react';
import botAvatar from '../assets/bot-avatar.png';
import api from '../utils/api';

const ChatAssistant = () => {
    // Check user role - only allow NGO and Volunteers
    const [userRole] = useState(() => localStorage.getItem('role') || '');
    const isAdmin = userRole === 'admin';

    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isChatEnabled, setIsChatEnabled] = useState(() => {
        const saved = localStorage.getItem('chatEnabled');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: 'Hello! I am EcoBot. How can I assist you with your waste management goals today?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            // Retrieve settings if needed, or just send message
            const payload = { message: userMsg.text };
            const res = await api.post('/assistant', payload);
            const reply = res.data?.reply || "I'm sorry, I didn't catch that.";

            const botMsg = { id: Date.now() + 1, type: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMsg = { id: Date.now() + 1, type: 'bot', text: "Sorry, I'm having trouble connecting right now.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickReply = (text) => {
        setInput(text);
        // Optional: auto-send
        // handleSend({ preventDefault: () => {} });
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        setIsMinimized(false);
    };

    const handleDisableChat = () => {
        setIsChatEnabled(false);
        localStorage.setItem('chatEnabled', 'false');
        setIsOpen(false);
        setIsMinimized(false);
    };

    // Listen for settings changes to re-enable chat
    useEffect(() => {
        const handleStorageChange = () => {
            const enabled = localStorage.getItem('chatEnabled');
            if (enabled !== null) {
                setIsChatEnabled(JSON.parse(enabled));
            }
        };
        window.addEventListener('storage', handleStorageChange);
        // Also check on component mount
        const checkEnabled = setInterval(() => {
            const enabled = localStorage.getItem('chatEnabled');
            if (enabled !== null && JSON.parse(enabled) !== isChatEnabled) {
                setIsChatEnabled(JSON.parse(enabled));
            }
        }, 1000);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(checkEnabled);
        };
    }, [isChatEnabled]);

    // Don't render if chat is disabled or user is admin
    if (!isChatEnabled || isAdmin) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

            {/* Minimized State */}
            {isOpen && isMinimized && (
                <button
                    onClick={() => setIsMinimized(false)}
                    className="pointer-events-auto mb-4 px-4 py-2 bg-[#123524] text-white rounded-full shadow-lg hover:bg-[#0d281a] transition-all flex items-center gap-2"
                >
                    <MessageCircle size={18} />
                    <span className="text-sm">EcoBot</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && !isMinimized && (
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[350px] md:w-[380px] h-[500px] flex flex-col mb-4 pointer-events-auto overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">

                    {/* Header */}
                    <div className="bg-[#123524] p-4 flex items-center justify-between text-white rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30 overflow-hidden">
                                    <img src={botAvatar} alt="EcoBot" className="w-full h-full object-cover" />
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#123524] rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-normal text-base leading-tight">EcoBot Assistant</h3>
                                <p className="text-xs text-green-100 opacity-80">Online | Ask me anything</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white" title="Minimize">
                                <Minus size={18} />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white" title="Close">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scrollbar-thin scrollbar-thumb-gray-200">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm ${msg.type === 'user'
                                    ? 'bg-[#123524] text-white !text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                    }`}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                    <p className={`text-[10px] mt-1 text-right ${msg.type === 'user' ? 'text-white/60' : 'text-gray-400'}`}>{msg.time}</p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center gap-2">
                                    <div className="w-2 h-2 bg-[#123524] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-[#123524] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-[#123524] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestions (Optional - only show if empty or specific state) */}
                    {messages.length === 1 && (
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
                            <button onClick={() => handleQuickReply("Find volunteer opportunities")} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-green-200 text-green-700 rounded-full text-xs font-normal hover:bg-green-50 transition-colors shadow-sm">
                                <Zap size={12} /> Opportunities
                            </button>
                            <button onClick={() => handleQuickReply("My impact report")} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-full text-xs font-normal hover:bg-blue-50 transition-colors shadow-sm">
                                <RefreshCw size={12} /> Impact
                            </button>
                        </div>
                    )}

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100">
                        <div className="relative flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                className="w-full bg-gray-100 text-gray-800 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#123524]/20 border-transparent transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="absolute right-1 p-2 bg-[#123524] text-white rounded-full hover:bg-[#0d281a] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md relative"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <Send size={16} className="text-white" />
                                )}
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-[10px] text-gray-400">Powered by WasteZero AI</span>
                        </div>
                    </form>
                </div>
            )}



            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="pointer-events-auto w-16 h-16 bg-[#123524] text-white rounded-full shadow-[0_4px_20px_rgba(18,53,36,0.3)] hover:shadow-[0_8px_30px_rgba(18,53,36,0.4)] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group relative"
                >
                    <img src={botAvatar} alt="Chat" className="w-8 h-8 object-contain group-hover:rotate-12 transition-transform duration-300" />
                </button>
            )}

        </div>
    );
};

export default ChatAssistant;
