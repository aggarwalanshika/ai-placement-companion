import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import LandingPage from './pages/LandingPage.tsx';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import Dashboard from './pages/Dashboard.tsx';
import ResumeAnalyzer from './pages/ResumeAnalyzer.tsx';
import DashboardLayout from './components/DashboardLayout.tsx';
import JobDescriptionMatcher from './pages/JobDescriptionMatcher.tsx';
import ResumeHistory from './pages/ResumeHistory.tsx';
import ResumeRewriter from './pages/ResumeRewriter.tsx';
import ResumePreview from './pages/ResumePreview.tsx';
import Settings from './pages/Settings.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { useAuthStore } from './store/authStore.ts';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await axios.post(
          'http://localhost:5000/api/auth/refresh',
          {},
          { withCredentials: true }
        );
        const { accessToken } = response.data;

        const userRes = await axios.get(
          'http://localhost:5000/api/auth/me',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const { user } = userRes.data;
        useAuthStore.getState().setAuth(user, accessToken);
      } catch (err) {
        useAuthStore.getState().clearAuth();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Dashboard App Pages protected by ProtectedRoute */}
      <Route element={<ProtectedRoute />}>
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
        <Route
          path="/resume-preview"
          element={
            <DashboardLayout>
              <ResumePreview />
            </DashboardLayout>
          }
        />
      </Route>
    </Routes>
  );
}
