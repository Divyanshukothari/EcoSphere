import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeft, Send, Loader2, Trash2, Plus, MessageSquare,
    Leaf, Pencil, Check, X, Zap, AlertCircle, Clock
} from 'lucide-react';

// ── Sub-components ────────────────────────────────────────────────────────────

const TypingIndicator = () => (
    <div className="flex items-end gap-3 mb-5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-base flex-shrink-0">🌿</div>
        <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-5 py-3.5 shadow-sm">
            <div className="flex gap-1.5 items-center h-4">
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    </div>
);

const MessageBubble = ({ msg }) => {
    const isUser = msg.role === 'user';
    const time = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    return (
        <div className={`flex items-end gap-3 mb-5 ${isUser ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
                isUser ? 'bg-gradient-to-br from-brand-600 to-emerald-600 text-white font-bold' : 'bg-gradient-to-br from-emerald-500 to-green-600 text-base'}`}>
                {isUser ? 'U' : '🌿'}
            </div>
            <div className={`max-w-[72%] flex flex-col gap-0.5 ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isUser ? 'bg-gradient-to-br from-brand-600 to-emerald-600 text-white rounded-br-sm'
                           : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {time && <p className="text-[10px] text-slate-400 px-1">{time}</p>}
            </div>
        </div>
    );
};

// ── Session Item in Sidebar ───────────────────────────────────────────────────

const SessionItem = ({ session, active, onSelect, onDelete, onRename }) => {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(session.title);
    const inputRef = useRef(null);

    useEffect(() => { if (editing) setTimeout(() => inputRef.current?.focus(), 50); }, [editing]);

    const saveRename = async () => {
        if (title.trim() && title !== session.title) await onRename(session.id, title.trim());
        setEditing(false);
    };

    const formatDate = (dt) => {
        const d = new Date(dt);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div
            onClick={() => !editing && onSelect(session.id)}
            className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                active ? 'bg-emerald-100/80 text-emerald-900' : 'hover:bg-slate-100 text-slate-700'
            }`}
        >
            <MessageSquare size={14} className={`flex-shrink-0 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
            {editing ? (
                <input
                    ref={inputRef}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setEditing(false); }}
                    className="flex-1 bg-white border border-emerald-300 rounded-lg px-2 py-0.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    onClick={e => e.stopPropagation()}
                />
            ) : (
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{session.title}</p>
                    <p className="text-[10px] text-slate-400">{formatDate(session.updated_at)}</p>
                </div>
            )}
            {editing ? (
                <div className="flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={saveRename} className="text-emerald-600 hover:text-emerald-700"><Check size={13} /></button>
                    <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-600"><X size={13} /></button>
                </div>
            ) : (
                <div className="hidden group-hover:flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setEditing(true)} className="text-slate-400 hover:text-slate-700 p-0.5"><Pencil size={12} /></button>
                    <button onClick={() => onDelete(session.id)} className="text-slate-400 hover:text-red-500 p-0.5"><Trash2 size={12} /></button>
                </div>
            )}
        </div>
    );
};

// ── Main ChatPage ─────────────────────────────────────────────────────────────

const ChatPage = () => {
    const { user } = useAuth();
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [usage, setUsage] = useState({ used: 0, limit: 10, remaining: 10 });
    const [limitError, setLimitError] = useState('');
    const [sessions, setSessions] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const queryClient = useQueryClient();

    // Fetch all sessions
    const { data: sessionsData, isLoading: sessionsLoading, refetch: refetchSessions } = useQuery({
        queryKey: ['chatSessions'],
        queryFn: api.getChatSessions,
    });

    const { data: usageData } = useQuery({
        queryKey: ['chatUsage'],
        queryFn: api.getChatUsage,
    });

    useEffect(() => { if (sessionsData) setSessions(sessionsData); }, [sessionsData]);
    useEffect(() => { if (usageData) setUsage(usageData); }, [usageData]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (activeSessionId) inputRef.current?.focus();
    }, [activeSessionId]);

    // Load session messages when switching
    const selectSession = useCallback(async (sessionId) => {
        setActiveSessionId(sessionId);
        setMessages([]);
        setLimitError('');
        try {
            const msgs = await api.getSessionMessages(sessionId);
            setMessages(msgs);
        } catch (err) {
            console.error('Failed to load messages', err);
        }
    }, []);

    // Create a new blank session
    const handleNewChat = async () => {
        try {
            const session = await api.createChatSession();
            setSessions(prev => [session, ...prev]);
            setActiveSessionId(session.id);
            setMessages([]);
            setLimitError('');
        } catch (err) {
            console.error('Failed to create session', err);
        }
    };

    // Delete a session
    const handleDelete = async (sessionId) => {
        if (!confirm('Delete this chat?')) return;
        await api.deleteChatSession(sessionId);
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (activeSessionId === sessionId) {
            setActiveSessionId(null);
            setMessages([]);
        }
    };

    // Rename a session
    const handleRename = async (sessionId, newTitle) => {
        await api.renameChatSession(sessionId, newTitle);
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: newTitle } : s));
    };

    // Send message
    const sendMessage = async () => {
        const text = input.trim();
        if (!text || isTyping || !activeSessionId || usage.remaining <= 0) return;

        setLimitError('');
        setMessages(prev => [...prev, { role: 'user', content: text, id: `local-${Date.now()}` }]);
        setInput('');
        setIsTyping(true);

        try {
            const data = await api.sendMessage(activeSessionId, text);
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply, id: `local-${Date.now() + 1}` }]);
            setUsage(data.usage);
            // Update session title if auto-titled
            if (data.session) {
                setSessions(prev => prev.map(s =>
                    s.id === activeSessionId ? { ...s, title: data.session.title, updated_at: new Date().toISOString() } : s
                ));
            }
        } catch (err) {
            if (err.status === 429) {
                setLimitError(err.message || "Daily limit reached.");
                setUsage(prev => ({ ...prev, remaining: 0 }));
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Something went wrong. Please try again.', id: `local-err-${Date.now()}` }]);
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
    const usageTextColor = remaining <= 2 ? 'text-red-600' : remaining <= 5 ? 'text-amber-600' : 'text-emerald-600';

    // Group sessions by date
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const grouped = { Today: [], Yesterday: [], Older: [] };
    sessions.forEach(s => {
        const d = new Date(s.updated_at).toDateString();
        if (d === today) grouped.Today.push(s);
        else if (d === yesterday) grouped.Yesterday.push(s);
        else grouped.Older.push(s);
    });

    return (
        <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
            {/* Top bar */}
            <header className="flex-shrink-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <Link to="/dashboard" className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                        <ArrowLeft size={16} />
                    </Link>
                    <button onClick={() => setSidebarOpen(o => !o)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors md:hidden">
                        <MessageSquare size={16} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-sm">🌿</div>
                        <div>
                            <p className="font-bold text-slate-800 text-sm leading-tight">EcoBot</p>
                            <p className="text-[10px] text-slate-400">Powered by Gemma 4 · Google AI</p>
                        </div>
                    </div>
                </div>
                {/* Usage pill */}
                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                        remaining <= 2 ? 'bg-red-50 border-red-200 text-red-600'
                        : remaining <= 5 ? 'bg-amber-50 border-amber-200 text-amber-600'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                        <Zap size={11} />
                        {remaining}/{usage.limit} today
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* ── Sidebar ── */}
                <aside className={`flex-shrink-0 w-60 bg-white border-r border-slate-100 flex flex-col overflow-hidden transition-all duration-300 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                    <div className="p-3 border-b border-slate-100">
                        <button
                            onClick={handleNewChat}
                            className="w-full flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-semibold text-sm rounded-xl transition-all active:scale-95 shadow-sm shadow-emerald-300/40"
                        >
                            <Plus size={16} /> New Chat
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {sessionsLoading && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 size={18} className="text-emerald-500 animate-spin" />
                            </div>
                        )}
                        {!sessionsLoading && sessions.length === 0 && (
                            <div className="text-center py-8 text-slate-400">
                                <MessageSquare size={24} className="mx-auto mb-2 opacity-40" />
                                <p className="text-xs">No chats yet</p>
                                <p className="text-[10px] mt-0.5">Start a new conversation!</p>
                            </div>
                        )}
                        {Object.entries(grouped).map(([group, items]) => items.length > 0 && (
                            <div key={group}>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 py-1.5">{group}</p>
                                {items.map(session => (
                                    <SessionItem
                                        key={session.id}
                                        session={session}
                                        active={activeSessionId === session.id}
                                        onSelect={selectSession}
                                        onDelete={handleDelete}
                                        onRename={handleRename}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Usage bar at bottom of sidebar */}
                    <div className="p-3 border-t border-slate-100 bg-slate-50/80">
                        <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-slate-500">Daily messages</span>
                            <span className={`font-bold ${usageTextColor}`}>{remaining} left</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${usageColor} rounded-full transition-all duration-700`} style={{ width: `${usagePct}%` }} />
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1"><Clock size={8} /> Resets at midnight</p>
                    </div>
                </aside>

                {/* ── Main area ── */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {!activeSessionId ? (
                        /* Welcome screen */
                        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-4xl shadow-xl shadow-emerald-200 mb-5">🌿</div>
                            <h2 className="font-display font-bold text-2xl text-slate-800 mb-2">What can I help with?</h2>
                            <p className="text-slate-500 text-sm max-w-md mb-8">
                                Ask EcoBot anything about environment, climate, ecology, sustainability, or nature. Powered by <span className="font-semibold text-emerald-600">Gemma 4</span>.
                            </p>
                            <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                                {[
                                    { q: 'What causes global warming?', e: '🌡️' },
                                    { q: 'How does ocean acidification work?', e: '🌊' },
                                    { q: 'What are renewable energy sources?', e: '☀️' },
                                    { q: 'Why is biodiversity important?', e: '🦋' },
                                    { q: 'How can I reduce my carbon footprint?', e: '♻️' },
                                    { q: 'What is the greenhouse effect?', e: '🌍' },
                                ].map(({ q, e }) => (
                                    <button key={q} onClick={async () => {
                                        // Create session first, then send the question directly
                                        try {
                                            const session = await api.createChatSession();
                                            setSessions(prev => [session, ...prev]);
                                            setActiveSessionId(session.id);
                                            setMessages([]);
                                            setLimitError('');

                                            // Send the question immediately
                                            setMessages([{ role: 'user', content: q, id: `local-${Date.now()}` }]);
                                            setIsTyping(true);
                                            const data = await api.sendMessage(session.id, q);
                                            setMessages([
                                                { role: 'user', content: q, id: `local-${Date.now()}` },
                                                { role: 'assistant', content: data.reply, id: `local-${Date.now() + 1}` }
                                            ]);
                                            setUsage(data.usage);
                                            if (data.session) {
                                                setSessions(prev => prev.map(s =>
                                                    s.id === session.id ? { ...s, title: data.session.title, updated_at: new Date().toISOString() } : s
                                                ));
                                            }
                                        } catch (err) {
                                            if (err.status === 429) {
                                                setLimitError(err.message || "Daily limit reached.");
                                                setUsage(prev => ({ ...prev, remaining: 0 }));
                                            }
                                        } finally {
                                            setIsTyping(false);
                                        }
                                    }}
                                        className="flex items-start gap-2 p-3.5 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-xl text-xs text-slate-600 hover:text-emerald-800 transition-all text-left group">
                                        <span className="text-base flex-shrink-0">{e}</span>
                                        <span className="font-medium leading-snug">{q}</span>
                                    </button>
                                ))}
                            </div>
                            <button onClick={handleNewChat} className="mt-6 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-emerald-200 hover:from-emerald-500 hover:to-green-400 transition-all active:scale-95 text-sm">
                                <Plus size={16} /> Start New Chat
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                {messages.length === 0 && (
                                    <div className="text-center py-16 text-slate-400">
                                        <p className="text-3xl mb-3">🌱</p>
                                        <p className="text-sm font-medium">New conversation started</p>
                                        <p className="text-xs mt-1">Ask me anything about the environment!</p>
                                    </div>
                                )}
                                {messages.map((msg, i) => <MessageBubble key={msg.id || i} msg={msg} />)}
                                {isTyping && <TypingIndicator />}
                                {limitError && (
                                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-4 text-sm">
                                        <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-amber-700">Daily Limit Reached</p>
                                            <p className="text-amber-600 text-xs mt-0.5">{limitError}</p>
                                        </div>
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* Input */}
                            <div className="flex-shrink-0 px-6 pb-6 pt-2">
                                {remaining <= 0 ? (
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-center">
                                        <p className="text-amber-700 font-semibold text-sm">⏰ Daily limit of {usage.limit} messages reached</p>
                                        <p className="text-amber-600 text-xs mt-1">Your messages reset at midnight. See you tomorrow!</p>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-100 p-3 flex items-end gap-3">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
                                            <Leaf size={13} className="text-white" />
                                        </div>
                                        <textarea
                                            ref={inputRef}
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            onKeyDown={handleKey}
                                            placeholder="Ask EcoBot anything about the environment…"
                                            rows={1}
                                            style={{ resize: 'none', maxHeight: '140px' }}
                                            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none leading-relaxed"
                                            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                                        />
                                        <button
                                            id="chat-send-btn"
                                            onClick={sendMessage}
                                            disabled={!input.trim() || isTyping}
                                            className="w-9 h-9 bg-gradient-to-br from-emerald-600 to-green-500 text-white rounded-xl flex items-center justify-center active:scale-90 disabled:opacity-30 flex-shrink-0 transition-all">
                                            {isTyping ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                                        </button>
                                    </div>
                                )}
                                <p className="text-center text-[10px] text-slate-400 mt-2">EcoBot may make mistakes — please verify important information.</p>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ChatPage;
