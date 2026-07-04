import { useState } from 'react';
import { Video, ShieldCheck, Code2, Users, Play, Clock } from 'lucide-react';

export default function InterviewHub() {
  const [activeSession, setActiveSession] = useState<string | null>(null);

  const interviewTypes = [
    {
      id: 'hr',
      title: 'HR Interview Simulation',
      description: 'Simulates general behavioral, communication, problem-solving, and salary-negotiation questions.',
      rating: 'Focus: Culture Fit & Speaking Fluency',
      icon: Users,
    },
    {
      id: 'tech',
      title: 'Technical Core Panel',
      description: 'Covers core computer science concepts, object-oriented designs, operating systems, and dynamic programming.',
      rating: 'Focus: Algorithms, OS, & Core Java/C++',
      icon: Code2,
    },
    {
      id: 'project',
      title: 'Resume & Project Deep-Dive',
      description: 'Grills you specifically on the projects and experiences documented inside your uploaded resume.',
      rating: 'Focus: Architecture & Implementation Details',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">AI Interview Sandbox</h1>
        <p className="text-slate-450 text-sm">Experience adaptive, voice-simulated placement panels and retrieve actionable speaking feedback reports.</p>
      </div>

      {activeSession ? (
        <div className="p-8 bg-slate-900/40 border border-blue-900/40 rounded-2xl shadow-xl flex flex-col items-center justify-center space-y-6 max-w-2xl mx-auto text-center">
          <div className="h-16 w-16 bg-blue-950/60 border border-blue-800 rounded-full flex items-center justify-center relative">
            <span className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping" />
            <Video className="w-8 h-8 text-blue-400" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Active Panel: {activeSession.toUpperCase()} Round</h3>
            <p className="text-xs text-slate-400">Mock simulation in progress... Speaking audio stream active.</p>
          </div>

          <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 text-left min-h-24">
            <span className="text-[10px] text-blue-400 font-bold block mb-1">AI INTERVIEWER</span>
            <p className="text-xs text-slate-350 leading-relaxed animate-pulse">
              "John, I see you implemented Redis Caching in your e-commerce repository. Why did you choose Redis over Memcached for session distribution, and what eviction policy did you define?"
            </p>
          </div>

          <div className="flex gap-4">
            <button className="px-5 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-xs font-semibold rounded-xl text-slate-300">
              Mute Mic
            </button>
            <button
              onClick={() => setActiveSession(null)}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-xs font-bold rounded-xl text-white shadow-lg shadow-red-500/20"
            >
              Stop Mock Simulation
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {interviewTypes.map((type) => (
            <div key={type.id} className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-xl flex flex-col justify-between hover:border-slate-700/80 transition-all">
              <div className="space-y-4">
                <div className="p-3 bg-slate-950/60 border border-slate-800/60 text-blue-400 rounded-xl w-fit">
                  <type.icon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white">{type.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{type.description}</p>
                </div>
              </div>
              
              <div className="mt-6 border-t border-slate-800/60 pt-4 flex flex-col gap-3">
                <span className="text-[10px] text-slate-500 font-medium italic block">{type.rating}</span>
                <button
                  onClick={() => setActiveSession(type.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-xl text-white shadow-lg shadow-blue-500/10 transition-all"
                >
                  Start Simulation <Play className="w-3 h-3 fill-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {!activeSession && (
        <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" /> Completed Rounds Log
          </h3>
          <div className="space-y-2.5 text-xs">
            {[
              { type: 'Behavioral Round', score: '8.4/10', date: '3 days ago', verdict: 'Strong Culture Fit' },
              { type: 'SQL & Database Round', score: '6.5/10', date: '1 week ago', verdict: 'Need revision on Indexing' }
            ].map((hist, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/60 border border-slate-800/50 rounded-xl">
                <div>
                  <span className="font-semibold text-white block">{hist.type}</span>
                  <span className="text-[10px] text-slate-550">Verdict: {hist.verdict}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-blue-400 block">{hist.score}</span>
                  <span className="text-[9px] text-slate-600 block">{hist.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
