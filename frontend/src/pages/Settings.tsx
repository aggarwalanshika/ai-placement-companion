import { Settings, Sliders, Shield, Key } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-fade-in text-xs text-slate-700">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-1.5">
            <Settings className="w-5 h-5 text-indigo-650" /> Account Settings
          </h1>
          <p className="text-slate-550 text-xs">Manage your profile, API configurations, and resume optimization defaults.</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* API key options */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-4 h-4 text-blue-500" /> Gemini API Integration
          </h3>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase block">API Key Status</label>
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl leading-relaxed">
                Active Key Authenticated: Your Google AI Studio Gemini API key is configured and active.
              </div>
            </div>
          </div>
        </div>

        {/* Model configurations */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-indigo-500" /> Model Configuration
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="font-bold text-slate-900 block">Active Model</span>
                <span className="text-[9px] text-slate-500 block">Active engine for comparisons</span>
              </div>
              <span className="font-semibold text-indigo-600 font-mono">gemini-2.5-flash</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="font-bold text-slate-900 block">Strict JSON Response</span>
                <span className="text-[9px] text-slate-500 block">Enforces application/json constraints</span>
              </div>
              <span className="text-[10px] font-bold text-green-600">ENABLED</span>
            </div>
          </div>
        </div>

        {/* Account permissions */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-purple-500" /> Security & Privacy
          </h3>
          
          <div className="space-y-2 text-slate-600 leading-relaxed pl-2">
            <p>• Scanned PDF files are temporarily parsed in memory and automatically unlinked from storage upon response.</p>
            <p>• Stored metadata logs contain text characters lengths and matching score distributions for analytics scans.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
