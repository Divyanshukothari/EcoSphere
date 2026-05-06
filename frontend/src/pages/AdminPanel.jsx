import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LayoutDashboard, Target, ClipboardList, Users, LogOut, Leaf, ShieldCheck, Plus, Edit2, Trash2, Check, X, ChevronDown, ChevronUp, ExternalLink, GraduationCap } from 'lucide-react';

const DIFF_COLOR = { easy:'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', medium:'bg-amber-500/20 text-amber-400 border-amber-500/30', hard:'bg-red-500/20 text-red-400 border-red-500/30' };
const STATUS_COLOR = { pending:'bg-amber-500/20 text-amber-400 border-amber-500/30', approved:'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', rejected:'bg-red-500/20 text-red-400 border-red-500/30' };
const ROLE_COLOR = { super_admin:'bg-purple-500/20 text-purple-400', teacher:'bg-blue-500/20 text-blue-400', student:'bg-slate-700 text-slate-300' };

const Badge = ({ label, color }) => <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${color}`}>{label}</span>;

const StatCard = ({ icon, label, value, sub }) => (
  <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
    <div className="text-2xl mb-2">{icon}</div>
    <p className="text-3xl font-bold text-white">{value}</p>
    <p className="text-slate-400 text-sm mt-0.5">{label}</p>
    {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
  </div>
);

const EMPTY_FORM = { title:'', description:'', category:'Environmental', difficulty:'medium', points:50, deadline:'' };

function OverviewTab() {
  const { data: stats, isLoading } = useQuery({ queryKey:['adminStats'], queryFn: api.adminGetStats, refetchInterval:30000 });
  const { data: subs = [] } = useQuery({ queryKey:['adminSubs','pending'], queryFn:()=>api.adminGetSubmissions('pending') });
  if (isLoading) return <div className="text-slate-500 py-20 text-center">Loading stats...</div>;
  return (
    <div>
      <h2 className="text-white font-bold text-xl mb-6">Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon="👥" label="Total Students" value={stats?.total_students ?? 0} />
        <StatCard icon="🎯" label="Active Challenges" value={stats?.active_challenges ?? 0} />
        <StatCard icon="⏳" label="Pending Reviews" value={stats?.pending_reviews ?? 0} sub="Awaiting your action" />
        <StatCard icon="✅" label="Approved Today" value={stats?.approved_today ?? 0} />
        <StatCard icon="🧑‍🏫" label="Pending Teachers" value={stats?.pending_teachers ?? 0} sub="Need approval" />
      </div>
      <h3 className="text-slate-300 font-semibold mb-3">Recent Pending Submissions</h3>
      {subs.length === 0 ? <p className="text-slate-600 text-sm">No pending submissions 🎉</p> : (
        <div className="space-y-2">
          {subs.slice(0,5).map(s => (
            <div key={s.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">{s.student_name?.[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{s.student_name}</p>
                <p className="text-slate-500 text-xs truncate">{s.challenge_title}</p>
              </div>
              <Badge label="pending" color={STATUS_COLOR.pending} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChallengesTab() {
  const qc = useQueryClient();
  const { data: challenges = [], isLoading } = useQuery({ queryKey:['adminChallenges'], queryFn: api.adminGetChallenges });
  const [modal, setModal] = useState(null); // null | 'create' | challenge object
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create'); };
  const openEdit = (c) => { setForm({ title:c.title, description:c.description, category:c.category, difficulty:c.difficulty, points:c.points, deadline:c.deadline?.slice(0,10)||'' }); setModal(c); };

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (modal === 'create') await api.adminCreateChallenge(form);
      else await api.adminUpdateChallenge(modal.id, form);
      qc.invalidateQueries(['adminChallenges']); qc.invalidateQueries(['adminStats']); setModal(null);
    } catch(err){ alert(err.message); } finally { setSaving(false); }
  };
  const del = async (id) => { if(!confirm('Delete this challenge?')) return; await api.adminDeleteChallenge(id); qc.invalidateQueries(['adminChallenges']); };
  const toggle = async (c) => { await api.adminUpdateChallenge(c.id,{is_active:!c.is_active}); qc.invalidateQueries(['adminChallenges']); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-xl">Challenges</h2>
        <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Plus size={16}/> New Challenge
        </button>
      </div>
      {isLoading ? <p className="text-slate-500 text-sm">Loading...</p> : challenges.length === 0 ? (
        <div className="text-center py-20"><p className="text-4xl mb-3">🎯</p><p className="text-slate-500">No challenges yet. Create one!</p></div>
      ) : (
        <div className="space-y-3">
          {challenges.map(c => (
            <div key={c.id} className={`bg-slate-800/60 border ${c.is_active?'border-slate-700/50':'border-slate-800'} rounded-2xl p-4 flex items-start gap-4`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className={`font-semibold text-sm ${c.is_active?'text-white':'text-slate-500'}`}>{c.title}</p>
                  <Badge label={c.difficulty} color={DIFF_COLOR[c.difficulty]} />
                  <Badge label={c.category} color="bg-slate-700 text-slate-300 border-slate-600" />
                  {!c.is_active && <Badge label="inactive" color="bg-slate-700 text-slate-500 border-slate-600" />}
                </div>
                <p className="text-slate-500 text-xs mb-2 line-clamp-2">{c.description}</p>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>⭐ {c.points} pts</span>
                  <span>📬 {c.total_submissions} submissions</span>
                  <span>⏳ {c.pending_count} pending</span>
                  <span>✅ {c.approved_count} approved</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={()=>toggle(c)} className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${c.is_active?'border-slate-600 text-slate-400 hover:text-white hover:border-slate-500':'border-emerald-700 text-emerald-500 hover:bg-emerald-500/10'}`}>
                  {c.is_active?'Deactivate':'Activate'}
                </button>
                <button onClick={()=>openEdit(c)} className="p-1.5 text-slate-500 hover:text-slate-200 transition-colors"><Edit2 size={14}/></button>
                <button onClick={()=>del(c.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-5">{modal==='create'?'Create Challenge':'Edit Challenge'}</h3>
            <form onSubmit={save} className="space-y-3">
              <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Challenge title" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
              <textarea required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Description — what should the student do?" rows={3} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500">
                  {['Environmental','Community','Personal','Education','Health'].map(c=><option key={c}>{c}</option>)}
                </select>
                <select value={form.difficulty} onChange={e=>setForm({...form,difficulty:e.target.value})} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500">
                  <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-slate-500 text-xs mb-1 block">Points reward</label><input type="number" min={1} max={1000} value={form.points} onChange={e=>setForm({...form,points:parseInt(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" /></div>
                <div><label className="text-slate-500 text-xs mb-1 block">Deadline (optional)</label><input type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setModal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors disabled:opacity-60">{saving?'Saving...':'Save Challenge'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SubmissionsTab() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('pending');
  const [expanded, setExpanded] = useState(null);
  const [noteModal, setNoteModal] = useState(null);
  const [note, setNote] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const { data: subs = [], isLoading } = useQuery({ queryKey:['adminSubs', filter], queryFn:()=>api.adminGetSubmissions(filter||undefined), refetchInterval:15000 });

  const review = async (id, status) => {
    setReviewing(true);
    try { await api.adminReviewSubmission(id, status, note||undefined); qc.invalidateQueries(['adminSubs']); qc.invalidateQueries(['adminStats']); setNoteModal(null); setNote(''); }
    catch(err){ alert(err.message); } finally { setReviewing(false); }
  };

  const filters = ['pending','approved','rejected',''];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-white font-bold text-xl">Submissions</h2>
        <div className="flex bg-slate-800 border border-slate-700 rounded-xl p-1 gap-1">
          {[['pending','⏳'],['approved','✅'],['rejected','❌'],['','All']].map(([v,label])=>(
            <button key={v} onClick={()=>setFilter(v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter===v?'bg-emerald-600 text-white':'text-slate-400 hover:text-white'}`}>{label}</button>
          ))}
        </div>
      </div>
      {isLoading ? <p className="text-slate-500 text-sm">Loading...</p> : subs.length === 0 ? (
        <div className="text-center py-20"><p className="text-4xl mb-3">📭</p><p className="text-slate-500">No {filter} submissions</p></div>
      ) : (
        <div className="space-y-3">
          {subs.map(s => (
            <div key={s.id} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-3 cursor-pointer" onClick={()=>setExpanded(expanded===s.id?null:s.id)}>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">{s.student_name?.[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white text-sm font-semibold">{s.student_name}</p>
                    <span className="text-slate-600">→</span>
                    <p className="text-slate-400 text-sm truncate">{s.challenge_title}</p>
                    <Badge label={s.challenge_difficulty} color={DIFF_COLOR[s.challenge_difficulty]} />
                    <Badge label={s.status} color={STATUS_COLOR[s.status]} />
                  </div>
                  <p className="text-slate-600 text-xs mt-0.5">{new Date(s.submitted_at).toLocaleDateString()} · {s.challenge_points} pts</p>
                </div>
                {expanded===s.id ? <ChevronUp size={14} className="text-slate-500 flex-shrink-0"/> : <ChevronDown size={14} className="text-slate-500 flex-shrink-0"/>}
              </div>
              {expanded===s.id && (
                <div className="px-4 pb-4 border-t border-slate-700/50 pt-3">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Proof Description</p>
                  <p className="text-slate-300 text-sm bg-slate-900/60 rounded-xl px-3 py-2.5 mb-3">{s.description}</p>
                  {s.proof_url && (
                    <a href={s.proof_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-sm mb-3 transition-colors">
                      <ExternalLink size={13}/> View Proof Link
                    </a>
                  )}
                  {s.admin_note && (
                    <div className="bg-slate-900/60 rounded-xl px-3 py-2 mb-3">
                      <p className="text-xs text-slate-500 mb-0.5">Admin note</p>
                      <p className="text-slate-400 text-sm">{s.admin_note}</p>
                    </div>
                  )}
                  {s.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={()=>setNoteModal({id:s.id,action:'approved'})} className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors">
                        <Check size={14}/> Approve
                      </button>
                      <button onClick={()=>setNoteModal({id:s.id,action:'rejected'})} className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors">
                        <X size={14}/> Reject
                      </button>
                    </div>
                  )}
                  {s.status !== 'pending' && s.reviewer_name && (
                    <p className="text-slate-600 text-xs">Reviewed by {s.reviewer_name} on {new Date(s.reviewed_at).toLocaleDateString()}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {noteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className={`font-bold text-lg mb-4 ${noteModal.action==='approved'?'text-emerald-400':'text-red-400'}`}>
              {noteModal.action==='approved'?'✅ Approve':'❌ Reject'} Submission
            </h3>
            <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Optional note to the student..." rows={3} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={()=>{setNoteModal(null);setNote('');}} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors">Cancel</button>
              <button onClick={()=>review(noteModal.id,noteModal.action)} disabled={reviewing} className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-colors disabled:opacity-60 ${noteModal.action==='approved'?'bg-emerald-600 hover:bg-emerald-500':'bg-red-600 hover:bg-red-500'}`}>
                {reviewing?'Processing...':noteModal.action==='approved'?'Confirm Approve':'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UsersTab() {
  const { data: users = [], isLoading } = useQuery({ queryKey:['adminUsers'], queryFn: api.adminGetUsers });
  const [search, setSearch] = useState('');
  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h2 className="text-white font-bold text-xl">Users <span className="text-slate-600 font-normal text-base">({users.length})</span></h2>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email…" className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64" />
      </div>
      {isLoading ? <p className="text-slate-500 text-sm">Loading...</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 text-left">
                {['User','Role','Badges','Lessons','Avg Quiz','Challenges','Joined'].map(h=>(
                  <th key={h} className="text-slate-500 font-medium pb-3 pr-4 text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map(u=>(
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0">{u.name?.[0]}</div>
                      <div><p className="text-white font-medium">{u.name}</p><p className="text-slate-600 text-xs">{u.email}</p></div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_COLOR[u.role]}`}>{u.role}</span>
                    {u.role === 'teacher' && !u.is_approved && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">pending</span>}
                  </td>
                  <td className="py-3 pr-4 text-slate-300">{u.badge_count}</td>
                  <td className="py-3 pr-4 text-slate-300">{u.total_lessons}</td>
                  <td className="py-3 pr-4 text-slate-300">{u.avg_quiz_score}%</td>
                  <td className="py-3 pr-4">
                    <span className="text-emerald-400 font-medium">{u.approved_challenges}</span>
                    {u.pending_challenges > 0 && <span className="text-amber-500 ml-1.5">+{u.pending_challenges} pending</span>}
                  </td>
                  <td className="py-3 text-slate-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-10 text-slate-600">No users match your search</p>}
        </div>
      )}
    </div>
  );
}

function TeachersTab() {
  const qc = useQueryClient();
  const { data: teachers = [], isLoading } = useQuery({ queryKey:['pendingTeachers'], queryFn: api.adminGetPendingTeachers, refetchInterval:15000 });
  const [acting, setActing] = useState(null);

  const handle = async (id, approved) => {
    setActing(id);
    try {
      await api.adminApproveTeacher(id, approved);
      qc.invalidateQueries(['pendingTeachers']);
      qc.invalidateQueries(['adminStats']);
      qc.invalidateQueries(['adminUsers']);
    } catch(err) { alert(err.message); }
    finally { setActing(null); }
  };

  return (
    <div>
      <h2 className="text-white font-bold text-xl mb-6">Teacher Approvals</h2>
      {isLoading ? <p className="text-slate-500 text-sm">Loading...</p> : teachers.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-slate-500">No teachers pending approval</p>
          <p className="text-slate-600 text-xs mt-1">New teacher registrations will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teachers.map(t => (
            <div key={t.id} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0">{t.name?.[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-slate-500 text-xs">{t.email}</p>
                <p className="text-slate-600 text-[10px] mt-0.5">Registered {new Date(t.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handle(t.id, true)}
                  disabled={acting === t.id}
                  className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Check size={14}/> Approve
                </button>
                <button
                  onClick={() => handle(t.id, false)}
                  disabled={acting === t.id}
                  className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <X size={14}/> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const TABS = [
  { id:'overview',     label:'Overview',    icon:LayoutDashboard },
  { id:'challenges',   label:'Challenges',  icon:Target },
  { id:'submissions',  label:'Submissions', icon:ClipboardList },
  { id:'teachers',     label:'Teachers',    icon:GraduationCap },
  { id:'users',        label:'Users',       icon:Users },
];

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('overview');
  const { data: stats } = useQuery({ queryKey:['adminStats'], queryFn: api.adminGetStats, refetchInterval:30000 });

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 fixed inset-y-0 left-0 z-30">
        <div className="px-5 py-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <Leaf size={13} className="text-white"/>
            </div>
            <span className="text-white font-bold text-sm">EcoSphere</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <ShieldCheck size={11} className="text-emerald-400"/>
            <span className="text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id} onClick={()=>setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab===id?'bg-emerald-600/20 text-emerald-400':'text-slate-500 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              <Icon size={16}/>
              {label}
              {id==='submissions' && stats?.pending_reviews > 0 && (
                <span className="ml-auto bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">{stats.pending_reviews}</span>
              )}
              {id==='teachers' && stats?.pending_teachers > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{stats.pending_teachers}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <div className="px-3 py-2 mb-2">
            <p className="text-white text-xs font-medium truncate">{user?.name}</p>
            <p className="text-slate-600 text-[10px] truncate">{user?.email}</p>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-400 text-sm transition-colors rounded-xl hover:bg-red-500/10">
            <LogOut size={14}/> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-56 p-8 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {tab === 'overview'    && <OverviewTab />}
          {tab === 'challenges'  && <ChallengesTab />}
          {tab === 'submissions' && <SubmissionsTab />}
          {tab === 'teachers'    && <TeachersTab />}
          {tab === 'users'       && <UsersTab />}
        </div>
      </main>
    </div>
  );
}
