import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layout/AppLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Protected Pages
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import ATSDashboard from './pages/ATSDashboard';
import RoleSuggestions from './pages/RoleSuggestions';
import RoleInterviews from './pages/RoleInterviews';
import PracticePrerequisite from './pages/PracticePrerequisite';
import InterviewScreen from './pages/InterviewScreen';
import InterviewEvaluation from './pages/InterviewEvaluation';
import EvaluationDashboard from './pages/EvaluationDashboard';
import ProgressTracker from './pages/ProgressTracker';
import Profile from './pages/Profile';
import ProfileOnboarding from './pages/ProfileOnboarding';
import Preferences from './pages/Preferences';
import Support from './pages/Support';
import Contact from './pages/Contact';
import WhyUs from './pages/WhyUs';
import Resources from './pages/Resources';
import MyCourses from './pages/MyCourses';
import CourseDetail from './pages/CourseDetail';
import CoursePlayer from './pages/CoursePlayer';
import Certificate from './pages/Certificate';

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

        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="resume-upload" element={<ResumeUpload />} />
          <Route path="ats-dashboard" element={<ATSDashboard />} />
          <Route path="role-suggestions" element={<RoleSuggestions />} />
          <Route path="role-interviews" element={<RoleInterviews />} />
          <Route path="practice-prerequisite" element={<PracticePrerequisite />} />
          <Route path="mock-interview" element={<InterviewScreen />} />
          <Route path="evaluation" element={<InterviewEvaluation />} />
          <Route path="evaluation-legacy" element={<EvaluationDashboard />} />
          <Route path="progress" element={<ProgressTracker />} />
          <Route path="progress-tracker" element={<ProgressTracker />} />
          <Route path="profile" element={<Profile />} />
          <Route path="onboarding" element={<ProfileOnboarding />} />
          <Route path="preferences" element={<Preferences />} />
          <Route path="support" element={<Support />} />
          <Route path="contact" element={<Contact />} />
          <Route path="why-us" element={<WhyUs />} />
          <Route path="resources" element={<Resources />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="courses/:courseId" element={<CourseDetail />} />
          <Route path="course/:courseId" element={<CoursePlayer />} />
          <Route path="certificate/:courseId" element={<Certificate />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
