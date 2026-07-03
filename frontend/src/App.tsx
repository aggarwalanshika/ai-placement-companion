import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Database, Activity, Code, Server, CheckCircle2, LogOut, User } from 'lucide-react';
import { useAuthStore } from './store/authStore.ts';
import { api } from './services/api.ts';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';

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

function DashboardHome() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await api.get('/health');
        setHealthData(response.data);
        setHealthError(null);
      } catch (err: any) {
        setHealthError(err.message || 'Failed to reach API server');
      } finally {
        setLoadingHealth(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // clear credentials locally even if remote request fails
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  const milestones = [
    { name: 'Milestone 1: Project Foundation', status: 'completed' },
    { name: 'Milestone 2: Authentication', status: 'completed' },
    { name: 'Milestone 3: Dashboard', status: 'pending' },
    { name: 'Milestone 4-8: Resume Analysis & RAG', status: 'pending' },
    { name: 'Milestone 9-10: DSA & Analytics', status: 'pending' },
    { name: 'Milestone 11-14: Interviewer & GitHub Mentoring', status: 'pending' },
    { name: 'Milestone 15: Deployment', status: 'pending' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 select-none font-sans relative">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation */}
      <header className="relative z-10 w-full max-w-4xl flex items-center justify-between border-b border-slate-900 pb-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            🎓 Placement Companion
          </span>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-900 px-3 py-1.5 border border-slate-800 rounded-xl">
              <User className="w-3.5 h-3.5 text-blue-400" /> {user.fullName} ({user.email})
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-950/40 border border-red-900/60 hover:bg-red-900/40 text-red-400 text-xs font-semibold rounded-xl transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        )}
      </header>

      <main className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left Column */}
        <section className="md:col-span-3 flex flex-col justify-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-950 border border-green-900 text-green-400 text-xs font-semibold tracking-wide w-fit">
            <span>Milestone 2 Complete</span>
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              AI Placement <br />
              <span className="text-blue-500 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Companion</span>
            </h1>
            <p className="mt-4 text-slate-400 text-lg">
              You are securely logged in. Access Token sliding refreshes, secure cookie credentials, and router redirection are fully operational.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'JWT Refresh', desc: 'Secure Cookie' },
              { label: 'Zustand State', desc: 'Local Storage' },
              { label: 'Axios Interceptor', desc: 'Auto Token refresh' },
              { label: 'Zod Validation', desc: 'Request schemas' },
              { label: 'Brute Force Shield', desc: 'Rate limiting' },
              { label: 'Prisma Client', desc: 'Model sessions' }
            ].map((stack, idx) => (
              <div key={idx} className="p-3 bg-slate-900/50 border border-slate-800/80 rounded-xl">
                <div className="text-sm font-semibold text-white">{stack.label}</div>
                <div className="text-xs text-slate-500">{stack.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column */}
        <section className="md:col-span-2 flex flex-col space-y-6 justify-center">
          {/* Health Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" /> System Health
              </span>
              <span className={`h-2.5 w-2.5 rounded-full ${healthError ? 'bg-red-500 animate-pulse' : 'bg-green-500 animate-ping'}`} />
            </div>

            {loadingHealth ? (
              <div className="text-xs text-slate-400 py-4 flex items-center justify-center gap-2">
                <Activity className="w-4 h-4 animate-spin text-blue-500" /> Connecting to backend...
              </div>
            ) : healthError ? (
              <div className="text-xs text-red-400 py-4 flex flex-col gap-2">
                <p>⚠️ Cannot connect to backend server.</p>
                <code className="bg-slate-950 p-2 rounded text-[10px] break-all border border-slate-900">{healthError}</code>
              </div>
            ) : healthData ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Backend Status</span>
                  <span className="font-semibold text-green-400 bg-green-950/40 px-2 py-0.5 rounded border border-green-900/60 uppercase">
                    {healthData.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-800/60 pt-3">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-slate-500" /> Database Connection
                  </span>
                  <span className="font-semibold text-green-400 bg-green-950/40 px-2 py-0.5 rounded border border-green-900/60 uppercase">
                    {healthData.services?.database?.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Database Latency</span>
                  <span className="font-mono text-slate-300">{healthData.services?.database?.latencyMs}ms</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Checklist Card */}
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

export default function App() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [restoringSession, setRestoringSession] = useState(true);

  useEffect(() => {
    const attemptSilentRefresh = async () => {
      try {
        // Fetch new access token using refresh token cookie
        const response = await api.post('/auth/refresh');
        const { accessToken } = response.data;

        // Retrieve user details with new access token
        const userRes = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        setAuth(userRes.data.user, accessToken);
      } catch {
        clearAuth();
      } finally {
        setRestoringSession(false);
      }
    };

    attemptSilentRefresh();
  }, [setAuth, clearAuth]);

  if (restoringSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center gap-2 font-sans select-none">
        <Activity className="w-5 h-5 animate-spin text-blue-500" /> Restoring session credentials...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardHome />} />
      </Route>
    </Routes>
  );
}
