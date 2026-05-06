import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Send, MessageCircle, Maximize2, AlertCircle, Loader2 } from 'lucide-react';

const TypingIndicator = () => (
    <div className="flex items-end gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-xs flex-shrink-0">🌿</div>
        <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
            <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    </div>
);

const Bubble = ({ msg }) => {
    const isUser = msg.role === 'user';
    return (
        <div className={`flex items-end gap-2 mb-3 ${isUser ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${isUser ? 'bg-brand-600 text-white font-bold' : 'bg-gradient-to-br from-emerald-500 to-green-600'}`}>
                {isUser ? 'U' : '🌿'}
            </div>
            <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                isUser ? 'bg-gradient-to-br from-brand-600 to-emerald-600 text-white rounded-br-sm'
                       : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'
            }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
        </div>
    );
};

const ChatWidget = () => {
    const { user } = useAuth();
    const isStudent = user?.role === 'student';

    // ── All hooks unconditionally at top ──────────────────────────────────────
    const [open, setOpen] = useState(false);
    // Widget-local session: created fresh each time widget opens (null = not started)
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);   // local-only, blank on each open
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [usage, setUsage] = useState({ used: 0, limit: 10, remaining: 10 });
    const [limitError, setLimitError] = useState('');
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const queryClient = useQueryClient();

    const { data: usageData } = useQuery({
        queryKey: ['chatUsage'],
        queryFn: api.getChatUsage,
        enabled: isStudent,
        refetchOnWindowFocus: false,
    });

    useEffect(() => { if (usageData) setUsage(usageData); }, [usageData]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 120);
    }, [open]);

    // Reset widget state to blank every time it OPENS
    const handleToggle = () => {
        if (!open) {
            // Clear everything → fresh blank chat
            setMessages([]);
            setSessionId(null);
            setInput('');
            setLimitError('');
        }
        setOpen(o => !o);
    };
    // ─────────────────────────────────────────────────────────────────────────

    if (!isStudent) return null;

    const isLimited = usage.remaining <= 0;

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || isTyping || isLimited) return;

        setLimitError('');
        setMessages(prev => [...prev, { role: 'user', content: text, id: Date.now() }]);
        setInput('');
        setIsTyping(true);

        try {
            let sid = sessionId;
            // On first message of this widget session → create a new backend session
            if (!sid) {
                const newSession = await api.createChatSession();
                sid = newSession.id;
                setSessionId(sid);
            }

            const data = await api.sendMessage(sid, text);
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply, id: Date.now() + 1 }]);
            setUsage(data.usage);
            // Invalidate sessions list so ChatPage sidebar reflects new session
            queryClient.invalidateQueries(['chatSessions']);
        } catch (err) {
            if (err.status === 429) {
                setLimitError(err.message || "Daily limit reached.");
                setUsage(prev => ({ ...prev, remaining: 0 }));
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Something went wrong. Please try again.', id: Date.now() + 1 }]);
            }
        } finally {
            setIsTyping(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const remaining = usage.remaining;
    const usagePct = ((usage.limit - remaining) / usage.limit) * 100;
    const usageColor = remaining <= 2 ? 'from-red-500 to-orange-500' : remaining <= 5 ? 'from-amber-400 to-yellow-400' : 'from-emerald-500 to-green-400';

    return (
        <>
            {/* Floating button */}
            <button
                id="ecobotToggle"
                onClick={handleToggle}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl shadow-emerald-900/30 flex items-center justify-center transition-all duration-300 ${
                    open ? 'bg-slate-800 rotate-90' : 'bg-gradient-to-br from-emerald-500 to-green-600 hover:scale-110'
                }`}
            >
                {open ? <X size={22} className="text-white" /> : <MessageCircle size={24} className="text-white" />}
                {!open && remaining <= 3 && remaining > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {remaining}
                    </span>
                )}
            </button>

            {/* Panel */}
            {open && (
                <div className="fixed bottom-24 right-6 z-50 w-[355px] flex flex-col rounded-3xl shadow-2xl shadow-black/25 border border-slate-200 bg-white overflow-hidden animate-pop-in">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-xl">🌿</div>
                            <div>
                                <p className="text-white font-bold text-sm">EcoBot</p>
                                <p className="text-emerald-100 text-[11px]">Ask me anything environmental</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link to="/chat" onClick={() => setOpen(false)} className="text-white/70 hover:text-white" title="View all chats">
                                <Maximize2 size={16} />
                            </Link>
                            <button onClick={handleToggle} className="text-white/70 hover:text-white"><X size={18} /></button>
                        </div>
                    </div>

                    {/* Usage bar */}
                    <div className="px-4 pt-2.5 pb-2 bg-slate-50 border-b border-slate-100 flex-shrink-0">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                            <span>Daily messages</span>
                            <span className={remaining <= 2 ? 'text-red-500 font-semibold' : ''}>{remaining}/{usage.limit} remaining</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${usageColor} rounded-full transition-all duration-500`} style={{ width: `${usagePct}%` }} />
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="overflow-y-auto px-4 py-4 bg-slate-50/40 flex-1" style={{ maxHeight: '320px' }}>
                        {messages.length === 0 && (
                            <div className="text-center py-6">
                                <div className="text-3xl mb-2">🌱</div>
                                <p className="text-slate-600 text-sm font-medium">Hi! I'm EcoBot</p>
                                <p className="text-slate-400 text-xs mt-1">Ask me about climate, ecology, sustainability, and more!</p>
                            </div>
                        )}
                        {messages.map((m, i) => <Bubble key={m.id || i} msg={m} />)}
                        {isTyping && <TypingIndicator />}
                        {limitError && (
                            <div className="flex gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-2 text-xs text-red-600">
                                <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />{limitError}
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="px-4 py-3 border-t border-slate-100 bg-white flex-shrink-0">
                        {isLimited ? (
                            <p className="text-center text-xs text-amber-500 font-semibold py-1">⏰ Daily limit reached. Resets at midnight.</p>
                        ) : (
                            <div className="flex items-end gap-2">
                                <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                                    placeholder="Ask about environment…" rows={1}
                                    style={{ resize: 'none', maxHeight: '90px' }}
                                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                                />
                                <button onClick={sendMessage} disabled={!input.trim() || isTyping}
                                    className="w-9 h-9 bg-gradient-to-br from-emerald-600 to-green-500 text-white rounded-xl flex items-center justify-center active:scale-90 disabled:opacity-40 flex-shrink-0 transition-all">
                                    {isTyping ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
