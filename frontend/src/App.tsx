import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.tsx';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import Dashboard from './pages/Dashboard.tsx';
import ResumeAnalyzer from './pages/ResumeAnalyzer.tsx';
import InterviewHub from './pages/InterviewHub.tsx';
import DsaTracker from './pages/DsaTracker.tsx';
import DashboardLayout from './components/DashboardLayout.tsx';

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
        path="/dsa-tracker"
        element={
          <DashboardLayout>
            <DsaTracker />
          </DashboardLayout>
        }
      />
      <Route
        path="/interviews"
        element={
          <DashboardLayout>
            <InterviewHub />
          </DashboardLayout>
        }
      />
    </Routes>
  );
}
