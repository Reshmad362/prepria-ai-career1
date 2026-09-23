import React, { useState, useRef, useContext } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { logActivity } from '../utils/activityLogger';
import { UserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/api';

export default function ResumeAnalyzer() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    setMessage({ type: '', text: '' });
    setExtractedData(null);

    if (!selectedFile) {
        setFile(null);
        return;
    }

    const fileExt = selectedFile.name.split('.').pop().toLowerCase();
    if (fileExt !== 'pdf' && fileExt !== 'docx') {
      setMessage({ type: 'error', text: 'Invalid file format. Only .pdf and .docx are allowed.' });
      setFile(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setMessage({ type: 'error', text: 'File exceeds 10MB limit.' });
      setFile(null);
      return;
    }

    if (selectedFile.size === 0) {
      setMessage({ type: 'error', text: 'Cannot upload an empty file.' });
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setMessage({ type: '', text: '' });
    setExtractedData(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/upload-resume`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: `Upload and analysis successful!` });
        if (data.data) {
           setExtractedData(data.data);
           
           // Calculate Score
           const score = data.data.skills?.length > 5 ? 85 : 65;
           const newResumeData = {
               ...data.data,
               id: `res_${Date.now()}`,
               uploadedAt: new Date().toISOString(),
               score: score,
               fileName: file.name
           };

           // Save to local storage array for the user
           if (user?.email) {
               const storageKey = `atsResumes_${user.email}`;
               let existingResumes = [];
               try {
                   existingResumes = JSON.parse(localStorage.getItem(storageKey)) || [];
               } catch (e) {}

               // Cleanup old resumes (> 7 days)
               const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
               existingResumes = existingResumes.filter(r => new Date(r.uploadedAt).getTime() > sevenDaysAgo);

               // Duplicate Check
               let isDuplicate = false;
               for (const r of existingResumes) {
                   // Compare skills overlap
                   const rSkills = r.skills || [];
                   const nSkills = newResumeData.skills || [];
                   const commonSkills = rSkills.filter(s => nSkills.includes(s));
                   const similarity = (commonSkills.length / Math.max(rSkills.length, nSkills.length, 1));
                   
                   if (similarity > 0.8 && r.experience === newResumeData.experience) {
                       isDuplicate = true;
                       break;
                   }
               }

               if (!isDuplicate) {
                   existingResumes.unshift(newResumeData);
                   localStorage.setItem(storageKey, JSON.stringify(existingResumes));
               } else {
                   setMessage({ type: 'warning', text: 'Upload successful. Note: Similar resume already exists in your dashboard.' });
               }
           }

           logActivity({
             type: "ats_analysis",
             title: "Resume Analyzed",
             description: `ATS Score: ${score}`,
             status: score > 70 ? "success" : "warning"
           });
        }
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setMessage({ type: 'error', text: data.detail || 'Upload or analysis failed.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Upload interrupted or network error occurred. Is FastAPI active on port 8000?' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-4xl font-manrope font-bold text-on-surface mb-2">Resume Analyzer</h1>
        <p className="text-on-surface-variant font-inter">Upload your resume to extract skills and match to top roles.</p>
      </div>

      <div className={`grid gap-8 ${extractedData ? 'lg:grid-cols-2' : 'max-w-2xl mx-auto'}`}>
      
        {/* Upload Card */}
        <div className="glass-card flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold font-manrope text-on-surface mb-2">Upload Resume</h2>
          <p className="text-on-surface-variant mb-8">PDF or DOCX allowed (max 10MB)</p>
          
          <div 
            className={`w-full border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all duration-300 ${
              file ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-high'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx"
              className="hidden"
            />
            
            <div className="flex flex-col items-center">
              <UploadCloud className={`w-12 h-12 mb-4 ${file ? 'text-primary' : 'text-outline-variant'}`} />
              {file ? (
                <p className="font-semibold text-on-surface">{file.name}</p>
              ) : (
                <>
                  <p className="text-on-surface font-medium mb-1"><span className="text-primary underline">Click to upload</span> or drag & drop</p>
                  <p className="text-xs text-on-surface-variant">We'll securely process your document</p>
                </>
              )}
            </div>
          </div>

          {message.text && (
            <div className={`mt-6 w-full p-4 rounded-xl flex items-center gap-3 font-medium ${
              message.type === 'error' ? 'bg-error-container text-on-error-container border border-error/20' 
              : message.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              : 'bg-tertiary-container text-on-tertiary-container border border-tertiary/20'
            }`}>
              {message.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <button 
            className={`btn-primary w-full mt-8 flex justify-center items-center gap-2 ${(!file || isUploading) ? 'opacity-50 cursor-not-allowed transform-none hover:scale-100' : ''}`}
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing ATS Content...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Extract Details
              </>
            )}
          </button>
        </div>

        {/* ATS Data Preview Panel */}
        {extractedData && (
          <div className="glass-panel rounded-2xl p-8 h-fit animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-outline-variant/15">
              <Sparkles className="w-6 h-6 text-tertiary" />
              <h3 className="text-2xl font-bold font-manrope text-on-surface">Extracted Profile</h3>
            </div>
            
            <div className="space-y-6 font-inter">
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/15">
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Experience Level</h4>
                  <p className="text-lg font-semibold text-primary">{extractedData.experience}</p>
              </div>
              
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/15">
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Education</h4>
                  <p className="text-on-surface">{extractedData.education}</p>
              </div>

              <div>
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Technical Skills</h4>
                  <div className="flex flex-wrap gap-2">
                      {extractedData.skills?.length > 0 ? (
                          extractedData.skills.map((skill, index) => (
                              <span key={index} className="px-3 py-1.5 bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium rounded-full">
                                {skill}
                              </span>
                          ))
                      ) : (
                          <span className="text-sm text-on-surface-variant italic">No technical skills detected</span>
                      )}
                  </div>
              </div>

              <div>
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Projects Detected</h4>
                  <ul className="space-y-2">
                      {extractedData.projects?.length > 0 ? (
                          extractedData.projects.map((proj, idx) => (
                              <li key={idx} className="flex gap-3 text-sm text-on-surface bg-surface-container p-3 rounded-lg border border-outline-variant/10">
                                <span className="text-primary mt-0.5">❖</span>
                                <span>{proj}</span>
                              </li>
                          ))
                      ) : (
                          <span className="text-sm text-on-surface-variant italic">No distinct project titles detected</span>
                      )}
                  </ul>
              </div>

              <div>
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Extracted Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                      {extractedData.keywords?.length > 0 ? (
                          extractedData.keywords.map((kw, i) => (
                              <span key={i} className="px-3 py-1 bg-surface-container-high border border-outline-variant/30 text-on-surface-variant text-xs rounded-full">
                                {kw}
                              </span>
                          ))
                      ) : (
                          <span className="text-sm text-on-surface-variant italic">None</span>
                      )}
                  </div>
              </div>
            </div>
            
            <div className="mt-8 flex gap-4">
               <button 
                  onClick={() => navigate('/ats-dashboard')}
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-md"
               >
                  View Full ATS Dashboard
               </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
