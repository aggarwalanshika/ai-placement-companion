import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Sparkles, Briefcase, History, Settings, LogOut, Bell, Menu, X, User } from 'lucide-react';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume Analyzer', href: '/resume-analyzer', icon: FileText },
    { name: 'Resume Rewriter', href: '/resume-rewriter', icon: Sparkles },
    { name: 'Job Matcher', href: '/job-description-matcher', icon: Briefcase },
    { name: 'Resume History', href: '/resume-history', icon: History },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    // Clear local states if any, then navigate to landing page
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans select-none">
      {/* Top Navbar */}
      <header className="bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-400 hover:text-white lg:hidden focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            🤖 Resume Copilot
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="p-2 text-slate-400 hover:text-white relative rounded-xl hover:bg-slate-800/50 transition-all">
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            <Bell className="h-5 w-5" />
          </button>

          {/* User Details */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>John Doe</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 border border-red-900/60 hover:bg-red-900/40 text-red-400 text-xs font-semibold rounded-xl transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-slate-900/30 border-r border-slate-800/80 p-4 space-y-2 flex-shrink-0">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-30 flex">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            
            {/* Drawer Content */}
            <nav className="relative flex flex-col w-64 max-w-xs bg-slate-900 border-r border-slate-800 p-4 space-y-2 h-full z-40 pt-20">
              {navigation.map((item) => {
                const active = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
}
