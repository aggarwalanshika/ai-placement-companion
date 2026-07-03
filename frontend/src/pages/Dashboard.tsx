import { Clock, Play, FileText, Code2, Video, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const stats = [
    { name: 'Resume ATS Score', value: '82%', description: 'Good compatibility', color: 'text-green-400', icon: FileText },
    { name: 'DSA Solved Target', value: '142 / 250', description: 'Streak: 12 days', color: 'text-blue-400', icon: Code2 },
    { name: 'Mock Interview Readiness', value: '7.8 / 10', description: 'Strong speaker', color: 'text-indigo-400', icon: Video },
  ];

  const recentActivity = [
    { type: 'resume', title: 'Resume parsed & analyzed', time: '2 hours ago', desc: 'ATS Score generated: 82% (+5 from prev)' },
    { type: 'dsa', title: 'Solved 3 Medium Array Questions', time: '1 day ago', desc: 'Platform: LeetCode. Topic: Arrays & Hashing' },
    { type: 'interview', title: 'HR Voice Simulation completed', time: '2 days ago', desc: 'Fluency: 8.5/10. Eye contact: N/A (Audio)' },
  ];

  const upcomingTasks = [
    { title: 'Revise weak area: Dynamic Programming', priority: 'High', due: 'Today' },
    { title: 'Upload customized resume for Google entry', priority: 'Medium', due: 'Tomorrow' },
    { title: 'Simulate Mock Technical round (Systems)', priority: 'Low', due: 'In 3 days' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back, John!</h1>
        <p className="text-slate-450 text-sm">Here is a summary of your placement preparation status for today.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-xl flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.name}</span>
              <div className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-slate-500">{stat.description}</p>
            </div>
            <div className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl text-slate-350">
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Recent Activity (Left 3 Columns) */}
        <div className="lg:col-span-3 p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Recent Activity</h3>
            <span className="text-xs text-blue-500 font-semibold cursor-pointer hover:underline flex items-center gap-0.5">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-4">
            {recentActivity.map((act, idx) => (
              <div key={idx} className="flex gap-4 p-4 bg-slate-950/60 border border-slate-800/50 rounded-xl">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                  {act.type === 'resume' && <FileText className="w-5 h-5 text-green-400" />}
                  {act.type === 'dsa' && <Code2 className="w-5 h-5 text-blue-400" />}
                  {act.type === 'interview' && <Video className="w-5 h-5 text-indigo-400" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">{act.title}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">{act.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks & Fast Actions (Right 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tasks */}
          <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" /> Upcoming Tasks
            </h3>
            
            <div className="space-y-3">
              {upcomingTasks.map((task, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/60 border border-slate-800/50 rounded-xl">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-white block">{task.title}</span>
                    <div className="flex gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        task.priority === 'High' ? 'bg-red-950/60 border border-red-900/60 text-red-400' :
                        task.priority === 'Medium' ? 'bg-yellow-950/60 border border-yellow-900/60 text-yellow-400' :
                        'bg-blue-950/60 border border-blue-900/60 text-blue-400'
                      }`}>
                        {task.priority} Priority
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">Due: {task.due}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Sandbox Launcher */}
          <div className="p-6 bg-blue-950/20 border border-blue-800 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Start Interview Sandbox</h3>
            <p className="text-xs text-slate-400">Boot up an AI agent simulated Voice session for HR, systems, or behaviorals.</p>
            <Link
              to="/interviews"
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-xl text-white shadow-lg shadow-blue-500/20 transition-all"
            >
              Launch Virtual Panel <Play className="w-3.5 h-3.5 fill-white" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
