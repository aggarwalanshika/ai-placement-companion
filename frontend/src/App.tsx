import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.tsx';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import Dashboard from './pages/Dashboard.tsx';
import ResumeAnalyzer from './pages/ResumeAnalyzer.tsx';
import DashboardLayout from './components/DashboardLayout.tsx';
import JobDescriptionMatcher from './pages/JobDescriptionMatcher.tsx';
import ResumeHistory from './pages/ResumeHistory.tsx';
import ResumeRewriter from './pages/ResumeRewriter.tsx';
import Settings from './pages/Settings.tsx';

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Dashboard App Pages */}
      <Route
        path="/dashboard"
        element={
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        }
      />
      <Route
        path="/resume-analyzer"
        element={
          <DashboardLayout>
            <ResumeAnalyzer />
          </DashboardLayout>
        }
      />
      <Route
        path="/resume-rewriter"
        element={
          <DashboardLayout>
            <ResumeRewriter />
          </DashboardLayout>
        }
      />
      <Route
        path="/job-description-matcher"
        element={
          <DashboardLayout>
            <JobDescriptionMatcher />
          </DashboardLayout>
        }
      />
      <Route
        path="/resume-history"
        element={
          <DashboardLayout>
            <ResumeHistory />
          </DashboardLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <DashboardLayout>
            <Settings />
          </DashboardLayout>
        }
      />
    </Routes>
  );
}
