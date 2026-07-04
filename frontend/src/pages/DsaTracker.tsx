import { Code2, Flame, Award, ChevronRight } from 'lucide-react';

export default function DsaTracker() {
  const difficultySummary = [
    { label: 'Easy problems', count: 74, total: 100, color: 'bg-green-500', text: 'text-green-400' },
    { label: 'Medium problems', count: 58, total: 100, color: 'bg-yellow-500', text: 'text-yellow-400' },
    { label: 'Hard problems', count: 10, total: 50, color: 'bg-red-500', text: 'text-red-400' },
  ];

  const topics = [
    { name: 'Arrays & Hashing', solved: 28, total: 30, pct: 93 },
    { name: 'Two Pointers', solved: 12, total: 15, pct: 80 },
    { name: 'Trees & Graphs', solved: 18, total: 40, pct: 45 },
    { name: 'Dynamic Programming', solved: 6, total: 30, pct: 20 },
  ];

  const recommendedProblems = [
    { title: 'House Robber II', topic: 'Dynamic Programming', platform: 'LeetCode', diff: 'Medium' },
    { title: 'Course Schedule', topic: 'Graphs', platform: 'LeetCode', diff: 'Medium' },
    { title: 'Merge k Sorted Lists', topic: 'Heaps/Linked Lists', platform: 'LeetCode', diff: 'Hard' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">DSA Tracker</h1>
          <p className="text-slate-450 text-sm">Monitor your algorithm solve targets and solve recommended placement problems.</p>
        </div>

        {/* Streak Badge */}
        <div className="flex items-center gap-2 bg-orange-950/40 border border-orange-900/60 text-orange-400 px-4 py-2 rounded-xl text-xs font-bold shadow-lg">
          <Flame className="w-4 h-4 fill-orange-400 animate-bounce" />
          <span>12 Day Active Streak</span>
        </div>
      </div>

      {/* Difficulty stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {difficultySummary.map((diff, idx) => (
          <div key={idx} className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-xl space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">{diff.label}</span>
              <span className={`font-bold ${diff.text}`}>{diff.count} / {diff.total}</span>
            </div>
            
            {/* Visual Progress Bar */}
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
              <div
                className={`h-full ${diff.color} rounded-full transition-all duration-1000`}
                style={{ width: `${(diff.count / diff.total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Topics list & recommendations split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Topic-wise solved list (3 columns) */}
        <div className="lg:col-span-3 p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" /> Topic Progress
          </h3>

          <div className="space-y-4">
            {topics.map((topic, idx) => (
              <div key={idx} className="space-y-1.5 p-3 bg-slate-950/60 border border-slate-800/50 rounded-xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">{topic.name}</span>
                  <span className="text-slate-450">{topic.solved} / {topic.total} solved ({topic.pct}%)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${topic.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tailored recommendations (2 columns) */}
        <div className="lg:col-span-2 p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-400" /> Daily Recommendations
          </h3>

          <div className="space-y-3">
            {recommendedProblems.map((prob, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/50 rounded-xl text-xs hover:border-slate-700 transition-all cursor-pointer">
                <div>
                  <span className="font-semibold text-white block hover:underline">{prob.title}</span>
                  <span className="text-[10px] text-slate-500">{prob.topic}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                    prob.diff === 'Hard' ? 'bg-red-950/60 border border-red-900/60 text-red-400' : 'bg-yellow-950/60 border border-yellow-900/60 text-yellow-400'
                  }`}>
                    {prob.diff}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
