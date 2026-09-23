import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { 
  FileText, UploadCloud, Trash2, ShieldCheck, Download, Plus, Search, 
  Filter, CheckCircle2, Award, ArrowRight, ExternalLink, Sparkles, BookOpen, AlertCircle, FileCheck 
} from 'lucide-react';
import { coursesData } from '../data/coursesData';
import { logActivity } from '../utils/activityLogger';
import { API_URL } from '../utils/api';

export default function DocumentCenter() {
  const navigate = useNavigate();
  const { profile, user, completionData } = useContext(UserContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [certificates, setCertificates] = useState([]);
  const fileInputRef = useRef(null);

  const activeEmail = user?.email || profile?.email || localStorage.getItem('activeUser') || localStorage.getItem('userEmail');

  // 1. Fetch Backend Additional Documents
  const fetchDocuments = async () => {
    try {
      if (!activeEmail) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/documents/list/${encodeURIComponent(activeEmail)}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDocuments(result.data || []);
        }
      }
    } catch (err) {
      console.error("Failed to fetch docs:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Discover Earned Course Certificates
  const loadCertificates = () => {
    if (!activeEmail) return;
    const earned = [];
    coursesData.forEach(course => {
      const certKey = `cert_${activeEmail}_${course.id}`;
      const progressKey = `progress_${course.id}`;
      const certRaw = localStorage.getItem(certKey);
      const progressRaw = localStorage.getItem(progressKey);

      let isCompleted = false;
      if (progressRaw) {
        try {
          const prog = JSON.parse(progressRaw);
          if (prog.isCompleted) isCompleted = true;
        } catch(e) {}
      }

      if (certRaw || isCompleted) {
        let certObj = certRaw ? JSON.parse(certRaw) : null;
        earned.push({
          courseId: course.id,
          courseTitle: course.title,
          category: course.category || 'Career Intelligence',
          id: certObj?.id || `CERT-${course.id}-VERIFIED`,
          issueDate: certObj?.issueDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        });
      }
    });
    setCertificates(earned);
  };

  useEffect(() => {
    if (activeEmail) {
      fetchDocuments();
      loadCertificates();
    }
  }, [activeEmail]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeEmail) return;

    const formData = new FormData();
    formData.append('user_id', activeEmail);
    formData.append('category', activeCategory === 'All' ? 'Career Document' : activeCategory); 
    formData.append('file', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setDocuments(prev => [...prev, result.data]);
        logActivity({
          type: "document_upload",
          title: "Career Document Uploaded",
          description: `Uploaded ${file.name}`,
          status: "success"
        });
      } else {
        alert("Failed to upload: " + (result.detail || "Unknown error"));
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload document.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm("Are you sure you want to remove this document?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/documents/${encodeURIComponent(activeEmail)}/${encodeURIComponent(docId)}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const result = await response.json();
      if (result.success) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const hasResume = completionData?.resumeStatus?.isUploaded || Boolean(profile?.skills?.length) || Boolean(profile?.score !== undefined);
  const atsScore = completionData?.resumeStatus?.score !== null ? completionData?.resumeStatus?.score : profile?.score;
  const resumeFileName = completionData?.resumeStatus?.fileName || profile?.resumeFileName || 'Resume.pdf';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 font-manrope">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Document Center</h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-primary border border-orange-200 dark:border-orange-900/30">
              <Sparkles className="w-3 h-3" /> Career Vault
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your verified resume, course certificates, and career credentials in one secure place.
          </p>
        </div>

        {/* Upload Additional Documents Trigger */}
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            className="hidden" 
            accept=".pdf,.docx,.jpg,.jpeg,.png"
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={uploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-sm font-bold shadow-md shadow-primary/25 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload Document</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ==================================================
          SECTION 1: PRIMARY RESUME
      ================================================== */}
      <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-primary flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">Primary Resume</h2>
              <p className="text-xs text-gray-500">Your core document used for ATS scoring and skill extraction</p>
            </div>
          </div>

          {hasResume ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
              <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded &amp; Analyzed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
              <AlertCircle className="w-3.5 h-3.5" /> Missing
            </span>
          )}
        </div>

        {hasResume ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-5 rounded-2xl bg-gray-50/70 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-primary shrink-0 shadow-xs">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
                  {resumeFileName}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  <span>ATS Score: <strong className="text-primary font-bold">{atsScore !== null ? atsScore : '--'}</strong></span>
                  <span>•</span>
                  <span>Extracted Skills: <strong className="text-gray-700 dark:text-gray-300">{profile?.skills?.length || 0}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
              <button
                onClick={() => navigate('/resume-upload')}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Scan New Version
              </button>
              <button
                onClick={() => navigate('/resume-upload')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/20 transition-all cursor-pointer"
              >
                <span>Resume Intelligence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 px-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 space-y-3">
            <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">No resume uploaded yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-0.5">
                Upload your resume to receive ATS feedback, skill breakdown, and personalized interview questions.
              </p>
            </div>
            <button
              onClick={() => navigate('/resume-upload')}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-bold shadow-md shadow-primary/25 transition-all cursor-pointer"
            >
              <span>Upload Resume →</span>
            </button>
          </div>
        )}
      </div>

      {/* ==================================================
          SECTION 2: CERTIFICATES & CREDENTIALS
      ================================================== */}
      <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">Course Certificates</h2>
              <p className="text-xs text-gray-500">Verified credentials earned through PREPRIA Learning Hub</p>
            </div>
          </div>

          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
            {certificates.length} {certificates.length === 1 ? 'Certificate' : 'Certificates'}
          </span>
        </div>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div 
                key={cert.courseId}
                className="p-5 rounded-2xl bg-gray-50/70 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                      {cert.category}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {cert.courseTitle}
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Issued: {cert.issueDate} • ID: {cert.id}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/certificate/${cert.courseId}`)}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0 cursor-pointer"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 space-y-3">
            <Award className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">No certificates earned yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-0.5">
                Complete modules in the AI Learning Hub to receive verifiable placement certificates.
              </p>
            </div>
            <button
              onClick={() => navigate('/my-courses')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Explore Learning Hub →</span>
            </button>
          </div>
        )}
      </div>

      {/* ==================================================
          SECTION 3: OTHER CAREER DOCUMENTS
      ================================================== */}
      <div className="bg-white dark:bg-[#111215] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.08] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">Additional Career Documents</h2>
              <p className="text-xs text-gray-500">Cover letters, portfolio files, and recommendation documents</p>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            + Add Document
          </button>
        </div>

        {documents.length > 0 ? (
          <div className="space-y-2.5">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-primary shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                      {doc.original_name}
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      {doc.category || 'Career Document'} • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDelete(doc.id)}
                    title="Remove document"
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 text-center py-6">
            No additional documents stored. Use the Upload Document button above to attach cover letters or portfolio assets.
          </p>
        )}
      </div>

    </div>
  );
}
