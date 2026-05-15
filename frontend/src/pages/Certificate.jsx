import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { coursesData } from '../data/coursesData';
import { Download, ArrowLeft, Award, ShieldCheck } from 'lucide-react';
import { sendEmailNotification } from '../utils/emailApi';
import './Certificate.css';

export default function Certificate() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  
  const [course, setCourse] = useState(null);
  const [certData, setCertData] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email || !courseId) return;

    // Find course
    const foundCourse = coursesData.find(c => String(c.id) === String(courseId));
    if (!foundCourse) {
      setLoading(false);
      return;
    }
    
    setCourse(foundCourse);

    // Validate Completion
    try {
      const progressStr = localStorage.getItem(`progress_${courseId}`);
      if (progressStr) {
        const progress = JSON.parse(progressStr);
        if (progress.isCompleted) {
          setIsValid(true);
          
          // Manage Unique Certificate ID
          const certKey = `cert_${user.email}_${courseId}`;
          let existingCert = localStorage.getItem(certKey);
          
          if (!existingCert) {
            const newCert = {
              id: `CERT-${courseId}-${Date.now().toString().slice(-6)}`,
              issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            };
            localStorage.setItem(certKey, JSON.stringify(newCert));
            setCertData(newCert);
            
            // Send Email Notification
            const triggerEmail = async () => {
              const emailSent = await sendEmailNotification(
                "certificate",
                "Certificate Generated - AI Career Platform",
                {
                  courseDetails: foundCourse.title,
                  certificateId: newCert.id,
                  downloadLink: window.location.href
                }
              );
              if (!emailSent) {
                console.warn("Certificate generated, but email notification failed to send.");
              }
            };
            triggerEmail();
            
          } else {
            setCertData(JSON.parse(existingCert));
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse progress for certificate", e);
    }
    
    setLoading(false);
  }, [courseId, user]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return null;

  if (!course || !isValid) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="bg-slate-800 p-8 rounded-2xl max-w-md border border-slate-700">
          <ShieldCheck className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-white mb-2">Certificate Locked</h2>
          <p className="text-slate-400 mb-6">
            You must complete 100% of the modules in <strong>{course?.title || 'this course'}</strong> to unlock your certificate.
          </p>
          <button 
            onClick={() => navigate(course ? `/course/${courseId}` : '/my-courses')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition"
          >
            {course ? 'Continue Course' : 'Back to Library'}
          </button>
        </div>
      </div>
    );
  }

  const userName = user?.name || user?.email?.split('@')[0] || "Dedicated Learner";

  return (
    <div className="cert-page animate-in fade-in duration-700">
      
      {/* Non-Printable Actions Navbar */}
      <div className="cert-actions">
        <Link to="/my-courses" className="cert-btn secondary">
          <ArrowLeft className="w-5 h-5" /> Back to Courses
        </Link>
        <button onClick={handlePrint} className="cert-btn primary">
          <Download className="w-5 h-5" /> Download PDF Certificate
        </button>
      </div>

      {/* Printable Certificate Area */}
      <div className="cert-wrapper">
        <div className="cert-border-outer"></div>
        <div className="cert-border-inner"></div>
        <div className="cert-background"></div>
        
        {/* Corners */}
        <div className="cert-corner-tl"></div>
        <div className="cert-corner-tr"></div>
        <div className="cert-corner-bl"></div>
        <div className="cert-corner-br"></div>

        <div className="cert-content">
          
          <div className="cert-header">
            <div className="cert-logo">
              <div className="cert-logo-icon"><Award className="w-6 h-6" /></div>
              AI CAREER PLATFORM
            </div>
            <h1 className="cert-title">Certificate of Completion</h1>
          </div>

          <div className="cert-body">
            <span className="cert-subtitle">This is to proudly certify that</span>
            <h2 className="cert-name">{userName}</h2>
            <p className="cert-statement">
              has successfully completed all modules and demonstrated outstanding proficiency in the comprehensive course:
            </p>
            <h3 className="cert-course-title">{course.title}</h3>
            <p className="cert-statement text-sm mt-2">
              Domain: <strong className="text-slate-800">{course.category}</strong> | Duration equivalent: <strong>{course.duration}</strong>
            </p>
          </div>

          <div className="cert-footer">
            <div className="cert-signature-block">
              <div className="cert-signature-line">
                {/* Mock Signature - In a real app this could be an SVG path */}
                <div style={{ fontFamily: "'Brush Script MT', cursive", fontSize: '24px', position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', color: '#1e293b' }}>
                  AI Platform Engine
                </div>
              </div>
              <span className="cert-signature-title">Lead Instructor</span>
            </div>

            <div className="cert-seal">
              <div className="cert-seal-inner">
                <Award className="w-6 h-6 mb-1 text-white/80" />
                <span className="cert-seal-text">Official</span>
                <span className="cert-seal-year">{new Date().getFullYear()}</span>
              </div>
            </div>

            <div className="cert-signature-block">
              <div className="cert-signature-line">
                <div style={{ fontFamily: 'monospace', fontSize: '14px', position: 'absolute', bottom: '5px', left: '50%', transform: 'translateX(-50%)', color: '#475569' }}>
                  {certData?.issueDate}
                </div>
              </div>
              <span className="cert-signature-title">Date Issued</span>
            </div>
          </div>

          <div className="cert-id-block">
            Certificate ID: {certData?.id} • Verify at aicareerplatform.com/verify
          </div>
          
        </div>
      </div>
    </div>
  );
}
