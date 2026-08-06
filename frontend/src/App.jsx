import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import { Loader2 } from 'lucide-react';

// Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

// Public Pages (Keep eager for fast initial load if preferred, or lazy load)
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OTPVerification from './pages/OTPVerification';
import SuccessReset from './pages/SuccessReset';

// Lazy Loaded Protected Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ResumeIntelligence = React.lazy(() => import('./pages/ResumeIntelligence'));
const CareerRoadmap = React.lazy(() => import('./pages/CareerRoadmap'));
const ATSDashboard = React.lazy(() => import('./pages/ATSDashboard'));
const RoleSuggestions = React.lazy(() => import('./pages/RoleSuggestions'));
const RoleInterviews = React.lazy(() => import('./pages/RoleInterviews'));
const PracticePrerequisite = React.lazy(() => import('./pages/PracticePrerequisite'));
const InterviewScreen = React.lazy(() => import('./pages/InterviewScreen'));
const InterviewEvaluation = React.lazy(() => import('./pages/InterviewEvaluation'));
const EvaluationDashboard = React.lazy(() => import('./pages/EvaluationDashboard'));
const Scorecard = React.lazy(() => import('./pages/Scorecard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const DocumentCenter = React.lazy(() => import('./pages/DocumentCenter'));
const ProfileOnboarding = React.lazy(() => import('./pages/ProfileOnboarding'));
const Preferences = React.lazy(() => import('./pages/Preferences'));
const Support = React.lazy(() => import('./pages/Support'));
const Contact = React.lazy(() => import('./pages/Contact'));
const WhyUs = React.lazy(() => import('./pages/WhyUs'));
const Resources = React.lazy(() => import('./pages/Resources'));
const MyCourses = React.lazy(() => import('./pages/MyCourses'));
const CourseDetail = React.lazy(() => import('./pages/CourseDetail'));
const CoursePlayer = React.lazy(() => import('./pages/CoursePlayer'));
const Certificate = React.lazy(() => import('./pages/Certificate'));
const JobBoard = React.lazy(() => import('./pages/JobBoard'));

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const isDemo = localStorage.getItem('isDemo') === 'true';
  
  if (!token && !isDemo) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/otp-verification" element={<OTPVerification />} />
        <Route path="/success-reset" element={<SuccessReset />} />

        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={
            <Suspense fallback={<PageLoader />}><Dashboard /></Suspense>
          } />
          <Route path="resume-upload" element={
            <Suspense fallback={<PageLoader />}><ResumeIntelligence /></Suspense>
          } />
          <Route path="ats-dashboard" element={
            <Suspense fallback={<PageLoader />}><ATSDashboard /></Suspense>
          } />
          <Route path="career-roadmap" element={
            <Suspense fallback={<PageLoader />}><CareerRoadmap /></Suspense>
          } />
          <Route path="role-suggestions" element={
            <Suspense fallback={<PageLoader />}><RoleSuggestions /></Suspense>
          } />
          <Route path="jobs" element={
            <Suspense fallback={<PageLoader />}><JobBoard /></Suspense>
          } />
          <Route path="role-interviews" element={
            <Suspense fallback={<PageLoader />}><RoleInterviews /></Suspense>
          } />
          <Route path="practice-prerequisite" element={
            <Suspense fallback={<PageLoader />}><PracticePrerequisite /></Suspense>
          } />
          <Route path="mock-interview" element={
            <Suspense fallback={<PageLoader />}><InterviewScreen /></Suspense>
          } />
          <Route path="evaluation" element={
            <Suspense fallback={<PageLoader />}><InterviewEvaluation /></Suspense>
          } />
          <Route path="evaluation-legacy" element={
            <Suspense fallback={<PageLoader />}><EvaluationDashboard /></Suspense>
          } />
          <Route path="progress" element={
            <Suspense fallback={<PageLoader />}><Scorecard /></Suspense>
          } />
          <Route path="progress-tracker" element={
            <Suspense fallback={<PageLoader />}><Scorecard /></Suspense>
          } />
          <Route path="profile" element={
            <Suspense fallback={<PageLoader />}><Profile /></Suspense>
          } />
          <Route path="document-center" element={
            <Suspense fallback={<PageLoader />}><DocumentCenter /></Suspense>
          } />
          <Route path="onboarding" element={
            <Suspense fallback={<PageLoader />}><ProfileOnboarding /></Suspense>
          } />
          <Route path="preferences" element={
            <Suspense fallback={<PageLoader />}><Preferences /></Suspense>
          } />
          <Route path="support" element={
            <Suspense fallback={<PageLoader />}><Support /></Suspense>
          } />
          <Route path="contact" element={
            <Suspense fallback={<PageLoader />}><Contact /></Suspense>
          } />
          <Route path="why-us" element={
            <Suspense fallback={<PageLoader />}><WhyUs /></Suspense>
          } />
          <Route path="resources" element={
            <Suspense fallback={<PageLoader />}><Resources /></Suspense>
          } />
          <Route path="my-courses" element={
            <Suspense fallback={<PageLoader />}><MyCourses /></Suspense>
          } />
          <Route path="courses/:courseId" element={
            <Suspense fallback={<PageLoader />}><CourseDetail /></Suspense>
          } />
          <Route path="course/:courseId" element={
            <Suspense fallback={<PageLoader />}><CoursePlayer /></Suspense>
          } />
          <Route path="certificate/:courseId" element={
            <Suspense fallback={<PageLoader />}><Certificate /></Suspense>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
