import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { coursesData } from '../data/coursesData';
import { Download, ArrowLeft, ShieldCheck, Printer, Loader2, CheckCircle2, Lock, PlayCircle, Award, Star } from 'lucide-react';
import { sendEmailNotification } from '../utils/emailApi';
import { generateCertificatePDF } from '../utils/certificatePdfGenerator';
import { getCourseActionState, validateCertificateBackend } from '../utils/engagementService';
import './Certificate.css';

export default function Certificate() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useContext(UserContext);
  
  const [course, setCourse] = useState(null);
  const [certData, setCertData] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const activeEmail = user?.email || profile?.email || localStorage.getItem('activeUser') || localStorage.getItem('userEmail') || 'guest';

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }

      // 1. Locate Course
      const foundCourse = coursesData.find(c => String(c.id).toLowerCase() === String(courseId).toLowerCase());
      if (!foundCourse) {
        setLoading(false);
        return;
      }

      setCourse(foundCourse);

      // 2. Strictly Validate via BACKEND (server-side certificate eligibility)
      // This ensures localStorage tampering cannot unlock certificates.
      const certKey = `cert_${activeEmail}_${foundCourse.id}`;
      const existingCertStr = localStorage.getItem(certKey);

      const backendResult = await validateCertificateBackend(foundCourse.id, activeEmail);
      const eligible = Boolean(backendResult?.eligible);

      if (cancelled) return;

      if (eligible) {
        setIsValid(true);

        if (!existingCertStr) {
          const newCert = {
            id: `CERT-${foundCourse.id}-${Date.now().toString().slice(-6)}`,
            issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          };
          localStorage.setItem(certKey, JSON.stringify(newCert));
          setCertData(newCert);

          // Trigger Notification
          sendEmailNotification(
            "certificate",
            "Certificate Generated - PREPRIA Career Intelligence",
            {
              courseDetails: foundCourse.title,
              certificateId: newCert.id,
              downloadLink: window.location.href
            }
          ).catch(e => console.warn("Certificate email notification error:", e));
        } else {
          try {
            setCertData(JSON.parse(existingCertStr));
          } catch (e) {
            setCertData({
              id: `CERT-${foundCourse.id}-${Date.now().toString().slice(-6)}`,
              issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            });
          }
        }
      } else {
        setIsValid(false);
        setCertData(null);
      }

      setLoading(false);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [courseId, activeEmail]);

  // Recipient name resolution priority
  const rawRecipientName = profile?.name && profile.name.trim() !== '' && profile.name !== 'Not found'
    ? profile.name
    : user?.name && user.name.trim() !== ''
    ? user.name
    : (activeEmail && activeEmail !== 'guest' ? activeEmail.split('@')[0] : 'Dedicated Learner');

  const recipientName = rawRecipientName.trim().toUpperCase();
  const certId = certData?.id || `CERT-${courseId}-908378`;
  const completionDate = certData?.issueDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Direct PDF Download Handler
  const handleDownloadPDF = async () => {
    if (!course || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setDownloadSuccess(false);

    try {
      await generateCertificatePDF({
        recipientName,
        courseTitle: course.title,
        courseCategory: course.category || 'Career Acceleration',
        courseDuration: course.duration || 'Comprehensive Track',
        certificateId: certId,
        issueDate: completionDate,
        verificationUrl: 'prepria.com/verify'
      });

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Unable to generate certificate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-xs text-gray-500 font-bold">Verifying Academic Course Credentials...</p>
        </div>
      </div>
    );
  }

  // If certificate is locked because course is not 100% completed or final exam not passed
  if (!isValid) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 font-manrope bg-[#F4F6F9]">
        <div className="max-w-md w-full text-center bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Certificate Locked
            </h2>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              You must complete 100% of all required curriculum modules, pass all checkpoint quizzes with &ge; 70%, and pass the Final Comprehensive Exam before this certificate can be generated.
            </p>
          </div>
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="w-full py-3 bg-primary hover:bg-primaryHover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Continue Coursework</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cert-page-container">
      
      {/* Top Action Control Bar (Outside the Certificate) */}
      <div className="cert-action-bar no-print">
        <Link to="/my-courses" className="cert-back-btn">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Learning Hub</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            title="Print Certificate"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className={`cert-btn ${downloadSuccess ? 'cert-btn-success' : 'cert-btn-primary'}`}
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating 300 DPI PDF...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Downloaded Successfully!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Official Certificate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ==================================================
          HIGH-RESOLUTION LIGHT CERTIFICATE CANVAS
          1050px x 742px Standard Landscape Canvas
      ================================================== */}
      <div id="certificate-print-area" className="cert-canvas">
        
        {/* Subtle Background Pattern & Watermark */}
        <div className="cert-bg-pattern" />

        {/* Elegant Dual Gold Borders & Orange Corner Accents */}
        <div className="cert-border-frame" />
        <div className="cert-border-inner-frame" />
        <div className="cert-corner cert-corner-tl" />
        <div className="cert-corner cert-corner-tr" />
        <div className="cert-corner cert-corner-bl" />
        <div className="cert-corner cert-corner-br" />

        {/* Certificate Main Content Layout */}
        <div className="cert-body-layout">
          
          {/* ──────────────────────────────────────────────────
              ZONE 1: HEADER (LOGO + VERIFIED BADGE + TITLE)
          ────────────────────────────────────────────────── */}
          <div className="cert-zone-header">
            <div className="cert-header-top-row">
              {/* Left Brand Identity */}
              <div className="cert-logo-wrapper">
                <div className="cert-logo-badge">
                  P
                </div>
                <div className="cert-logo-text-group">
                  <div className="cert-logo-title">PREPRIA</div>
                  <div className="cert-logo-tagline">AI CAREER INTELLIGENCE PLATFORM</div>
                </div>
              </div>

              {/* Right Verified Badge */}
              <div className="cert-verified-pill">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>VERIFIED CERTIFICATE</span>
              </div>
            </div>

            {/* Certificate Main Title */}
            <h1 className="cert-main-title">
              CERTIFICATE OF CAREER ACCELERATION &amp; ACHIEVEMENT
            </h1>
            <div className="cert-divider-line" />
          </div>

          {/* ──────────────────────────────────────────────────
              ZONE 2: RECIPIENT & COURSE COMPLETION
          ────────────────────────────────────────────────── */}
          <div className="cert-zone-main">
            <span className="cert-presentation-label">
              This is officially presented to
            </span>

            {/* Recipient Full Name */}
            <h2 className="cert-recipient-name">
              {recipientName}
            </h2>

            {/* Description / Achievement Text */}
            <p className="cert-for-completing">
              For successfully completing all rigorous academic curriculum modules, passing required checkpoint assessments, and demonstrating verified practical competencies in
            </p>

            {/* Course Title Badge */}
            <div className="cert-course-title-box">
              <h3 className="cert-course-title">
                {course.title}
              </h3>
            </div>

            {/* Curriculum Meta Info */}
            <div className="cert-curriculum-meta">
              {course.category} • {course.duration} Curriculum
            </div>
          </div>

          {/* ──────────────────────────────────────────────────
              ZONE 3: AUTHORIZATION & SEAL & SIGNATURES
          ────────────────────────────────────────────────── */}
          <div className="cert-zone-auth">
            {/* Left Signature Block */}
            <div className="cert-sig-block">
              <div className="cert-sig-script">
                Elena Rostova
              </div>
              <div className="cert-sig-line" />
              <div className="cert-sig-name">DR. ELENA ROSTOVA</div>
              <div className="cert-sig-role">Lead Academic Director, PREPRIA</div>
            </div>

            {/* Center Verified Emblem Seal */}
            <div className="cert-seal-badge">
              <Star className="cert-seal-star fill-primary" />
              <span className="cert-seal-text-top">PREPRIA</span>
              <span className="cert-seal-text-mid">VERIFIED</span>
              <span className="cert-seal-text-bot">ACCREDITED</span>
            </div>

            {/* Right Signature Block */}
            <div className="cert-sig-block">
              <div className="cert-sig-script">
                Marcus Vance
              </div>
              <div className="cert-sig-line" />
              <div className="cert-sig-name">MARCUS VANCE</div>
              <div className="cert-sig-role">Head of Career Intelligence &amp; AI</div>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────
              ZONE 4: FOOTER METADATA (ISSUE DATE + CERT ID + VERIFY)
          ────────────────────────────────────────────────── */}
          <div className="cert-zone-footer">
            <div className="cert-footer-col text-left">
              <span className="cert-footer-label">Issue Date</span>
              <span className="cert-footer-val">{completionDate}</span>
            </div>

            <div className="cert-footer-col text-center">
              <span className="cert-footer-label">Certificate ID</span>
              <span className="cert-footer-val cert-footer-val-id">{certId}</span>
            </div>

            <div className="cert-footer-col text-right">
              <span className="cert-footer-label">Verification</span>
              <span className="cert-footer-val cert-footer-val-verify">prepria.com/verify</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
