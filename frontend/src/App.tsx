import { useEffect, useState } from 'react';
import { Database, Activity, Code, Server, CheckCircle2 } from 'lucide-react';

interface HealthResponse {
  success: boolean;
  status: string;
  uptime: number;
  services: {
    database: {
      status: string;
      latencyMs: number;
    };
  };
}

export default function App() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/health`);
        if (!response.ok) throw new Error('Backend server did not respond successfully');
        const data = await response.json();
        setHealthData(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to reach API server');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    // Poll health status every 10 seconds
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const milestones = [
    { name: 'Milestone 1: Project Foundation', status: 'completed' },
    { name: 'Milestone 2: Authentication', status: 'pending' },
    { name: 'Milestone 3: Dashboard', status: 'pending' },
    { name: 'Milestone 4-8: Resume Analysis & RAG', status: 'pending' },
    { name: 'Milestone 9-10: DSA & Analytics', status: 'pending' },
    { name: 'Milestone 11-14: Interviewer & GitHub Mentoring', status: 'pending' },
    { name: 'Milestone 15: Deployment', status: 'pending' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 select-none font-sans">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <main className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Left Column: Heading and Description */}
        <section className="md:col-span-3 flex flex-col justify-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-400 text-xs font-semibold tracking-wide w-fit">
            <span>Milestone 1 Complete</span>
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              AI Placement <br />
              <span className="text-blue-500 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Companion</span>
            </h1>
            <p className="mt-4 text-slate-400 text-lg">
              A production-ready platform that helps students prepare for software engineering placements with resume feedback, RAG-powered chats, coding analytics, and simulated voice interviews.
            </p>
          </div>

          {/* Dev Stack Badge Grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'React + TS', desc: 'Vite Client' },
              { label: 'Express', desc: 'Node Service' },
              { label: 'Postgres', desc: 'Prisma ORM' },
              { label: 'Redis', desc: 'Cache Layer' },
              { label: 'Qdrant', desc: 'Vector DB' },
              { label: 'Docker', desc: 'Orchestrator' }
            ].map((stack, idx) => (
              <div key={idx} className="p-3 bg-slate-900/50 border border-slate-800/80 rounded-xl">
                <div className="text-sm font-semibold text-white">{stack.label}</div>
                <div className="text-xs text-slate-500">{stack.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Status Card and Checklist */}
        <section className="md:col-span-2 flex flex-col space-y-6 justify-center">
          
          {/* Real-time Health Check Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" /> System Health
              </span>
              <span className={`h-2.5 w-2.5 rounded-full ${error ? 'bg-red-500 animate-pulse' : 'bg-green-500 animate-ping'}`} />
            </div>

            {loading ? (
              <div className="text-xs text-slate-400 py-4 flex items-center justify-center gap-2">
                <Activity className="w-4 h-4 animate-spin text-blue-500" /> Connecting to backend...
              </div>
            ) : error ? (
              <div className="text-xs text-red-400 py-4 flex flex-col gap-2">
                <p>⚠️ Cannot connect to backend server.</p>
                <code className="bg-slate-950 p-2 rounded text-[10px] break-all border border-slate-900">{error}</code>
                <p className="text-slate-500 text-[10px]">Ensure docker containers are running and server is listening on port 5000.</p>
              </div>
            ) : healthData ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Backend Status</span>
                  <span className="font-semibold text-green-400 bg-green-950/40 px-2 py-0.5 rounded border border-green-900/60 uppercase">
                    {healthData.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Uptime</span>
                  <span className="font-mono text-slate-300">{Math.round(healthData.uptime)} seconds</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-800/60 pt-3">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-slate-500" /> Database Connection
                  </span>
                  <span className="font-semibold text-green-400 bg-green-950/40 px-2 py-0.5 rounded border border-green-900/60 uppercase">
                    {healthData.services?.database?.status || 'Active'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Database Latency</span>
                  <span className="font-mono text-slate-300">{healthData.services?.database?.latencyMs}ms</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Roadmap Milestone Check Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-400" /> Development Progress
            </h3>
            <div className="space-y-2.5">
              {milestones.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className={`${m.status === 'completed' ? 'text-slate-300 font-medium' : 'text-slate-600'}`}>
                    {m.name}
                  </span>
                  {m.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 fill-green-950" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-800 bg-slate-950" />
                  )}
                </div>
              ))}
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}
