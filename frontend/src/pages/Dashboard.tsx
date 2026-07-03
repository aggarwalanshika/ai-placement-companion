import { Link } from 'react-router-dom';
import {
  FileText,
  Code2,
  Video,
  Layers,
  Bookmark,
  Sparkles,
} from 'lucide-react';

export default function Dashboard() {
  const topCards = [
    { label: 'Resume ATS Score', value: '82%', subtext: '+3% improvement', icon: FileText, color: 'text-emerald-400' },
    { label: 'Interview Readiness', value: '7.8 / 10', subtext: 'Based on 2 mock sessions', icon: Video, color: 'text-indigo-400' },
    { label: 'DSA solves target', value: '142 / 250', subtext: 'Streak: 12 days', icon: Code2, color: 'text-blue-400' },
    { label: 'Active Applications', value: '8 Companies', subtext: '3 rounds active', icon: Layers, color: 'text-purple-400' },
  ];

  const quickActions = [
    { title: 'Analyze Resume', desc: 'Run keywords gap checks', href: '/resume-analyzer', icon: FileText },
    { title: 'Start Mock Interview', desc: 'Boot voice sandbox session', href: '/interviews', icon: Video },
    { title: 'Practice DSA Questions', desc: 'Solve daily recommended problem', href: '/dsa-tracker', icon: Code2 },
  ];

  const targetCompanies = [
    { name: 'Google', role: 'Software Engineer Intern', status: 'Applied', date: 'Jul 10' },
    { name: 'Microsoft', role: 'SDE-1', status: 'OA Round', date: 'Jul 14' },
    { name: 'Atlassian', role: 'Graduate Engineer', status: 'Interview Prep', date: 'Jul 20' },
  ];

  const activities = [
    { date: 'Jul 3', title: 'Solved "Longest Consecutive Sequence"', platform: 'LeetCode', diff: 'Medium' },
    { date: 'Jul 2', title: 'Completed systems deep-dive mock round', score: '7.8/10', fluency: 'High' },
    { date: 'Jun 30', title: 'Uploaded resume draft (Resume_SE_V2.pdf)', grade: '82%' },
  ];

  const tasks = [
    { title: 'Practice graph BFS/DFS traversals', due: 'Today', urgency: 'High' },
    { title: 'Refactor experiences verbs on resume', due: 'Tomorrow', urgency: 'Medium' },
    { title: 'Build portfolio README documentation', due: 'In 3 days', urgency: 'Low' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" /> John's Preparation Workspace
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">Track your interview preparation status and dynamic target suggestions.</p>
        </div>
        <div className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
          Updated: Just Now
        </div>
      </div>

      {/* Top Cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {topCards.map((card, idx) => (
          <div key={idx} className="p-4 bg-slate-900/20 border border-slate-800/80 rounded-xl space-y-3 shadow-md">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">{card.label}</span>
              <card.icon className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <div className={`text-2xl font-extrabold ${card.color}`}>{card.value}</div>
              <span className="text-[9px] text-slate-500">{card.subtext}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Primary Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Custom Native CSS Solve Chart */}
          <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Weekly DSA Solve Counts</h3>
                <span className="text-[10px] text-slate-550">Target vs Solved problems count</span>
              </div>
              <div className="flex items-center gap-3 text-[9px] font-bold">
                <span className="flex items-center gap-1 text-blue-400">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Solved
                </span>
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-slate-800" /> Target
                </span>
              </div>
            </div>

            {/* Simulated Chart Bars */}
            <div className="h-32 flex items-end justify-between pt-6 px-4 relative">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 border-b border-slate-800">
                <div className="border-b border-slate-800 w-full" />
                <div className="border-b border-slate-800 w-full" />
                <div className="border-b border-slate-800 w-full" />
              </div>

              {[
                { day: 'Mon', solved: 45, target: 80 },
                { day: 'Tue', solved: 60, target: 80 },
                { day: 'Wed', solved: 85, target: 80 },
                { day: 'Thu', solved: 50, target: 80 },
                { day: 'Fri', solved: 95, target: 80 },
                { day: 'Sat', solved: 70, target: 80 },
                { day: 'Sun', solved: 110, target: 80 }
              ].map((val, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 z-10 w-8 group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-800 text-[8px] font-bold px-2 py-0.5 rounded text-white z-50 shadow-md">
                    Solved: {val.solved}
                  </div>

                  <div className="w-full flex justify-center items-end gap-1.5 h-20">
                    <div
                      className="w-2.5 bg-blue-600 rounded-t-sm group-hover:bg-blue-500 transition-all duration-500"
                      style={{ height: `${(val.solved / 120) * 100}%` }}
                    />
                    <div
                      className="w-1.5 bg-slate-800 rounded-t-sm"
                      style={{ height: `${(val.target / 120) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">{val.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions (Dashboard Launcher Links) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((act, idx) => (
              <Link
                key={idx}
                to={act.href}
                className="p-4 bg-slate-900/10 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/30 rounded-xl transition-all space-y-1 block"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-200 block">{act.title}</span>
                  <act.icon className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <p className="text-[10px] text-slate-500">{act.desc}</p>
              </Link>
            ))}
          </div>

          {/* Applications list */}
          <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-purple-400" /> Active Application pipeline
            </h3>

            <div className="space-y-2 text-xs">
              {targetCompanies.map((comp, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/40 border border-slate-900 rounded-lg">
                  <div>
                    <span className="font-bold text-white">{comp.name}</span>
                    <span className="text-[10px] text-slate-500 block">{comp.role}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[9px] font-bold text-purple-400 bg-purple-950/20 border border-purple-900/40 px-2 py-0.5 rounded">
                      {comp.status}
                    </span>
                    <span className="text-[9px] text-slate-600 block mt-1 font-mono">Deadline: {comp.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          
          {/* Upcoming Tasks */}
          <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Preparation Tasks</h3>
            
            <div className="space-y-2.5">
              {tasks.map((task, idx) => (
                <div key={idx} className="p-3 bg-slate-950/40 border border-slate-900 rounded-lg space-y-1.5 text-xs">
                  <span className="font-semibold text-slate-200 block leading-tight">{task.title}</span>
                  <div className="flex justify-between items-center text-[9px]">
                    <span className={`font-bold uppercase ${
                      task.urgency === 'High' ? 'text-red-400' : task.urgency === 'Medium' ? 'text-yellow-400' : 'text-blue-400'
                    }`}>
                      {task.urgency} Urgency
                    </span>
                    <span className="text-slate-500 font-mono">Due: {task.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log Timeline */}
          <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Activity Feed</h3>
            
            <div className="space-y-4 relative pl-3 border-l border-slate-900">
              {activities.map((act, idx) => (
                <div key={idx} className="relative space-y-1 text-xs">
                  <div className="absolute top-1.5 -left-[16px] h-2.5 w-2.5 rounded-full bg-slate-800 border-2 border-slate-950" />
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-mono">{act.date}</span>
                  </div>
                  <span className="font-semibold text-slate-300 block leading-tight">{act.title}</span>
                  <p className="text-[10px] text-slate-500">
                    {act.platform || act.score || act.grade ? `${act.platform || ''} ${act.score || ''} ${act.grade || ''}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
