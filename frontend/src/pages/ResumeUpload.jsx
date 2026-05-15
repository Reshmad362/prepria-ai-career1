import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { UploadCloud, File, AlertCircle, Loader2 } from 'lucide-react';
import { logActivity } from '../utils/activityLogger';
import { sendEmailNotification } from '../utils/emailApi';

export default function ResumeUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const isDemo = localStorage.getItem('isDemo') === 'true';
  const navigate = useNavigate();
  const { profile, updateProfile } = useContext(UserContext);

  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (isDemo) {
      alert("Please sign in to upload resumes.");
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (isDemo) {
      e.preventDefault();
      alert("Please sign in to upload resumes.");
      return;
    }
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsUploading(true);
    
    try {
      const prefs = JSON.parse(localStorage.getItem('userPreferences')) || {};
      const formData = new FormData();
      formData.append('file', file);
      if (prefs.careerGoals) {
        formData.append('career_goals', prefs.careerGoals);
      }
      
      const response = await fetch('http://localhost:8000/upload-resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        
        // PHASE 4 — CHECK BACKEND RESPONSE
        // Only extract resume-specific fields, ignoring anything else like email/name to prevent overwrites
        const { skills, experience, projects, education, score } = data.data || {};
        
        const resumeData = {};
        if (skills !== undefined) resumeData.skills = skills;
        if (experience !== undefined) resumeData.experience = experience;
        if (projects !== undefined) resumeData.projects = projects;
        if (education !== undefined) resumeData.education = education;
        if (score !== undefined) resumeData.score = score;

        // PHASE 5 — DEBUG CHECK
        console.log("Before upload:", profile);
        console.log("Resume parsed:", data.data);
        console.log("After merge:", { ...profile, ...resumeData });

        updateProfile(resumeData);
        
        // --- NEW LOGIC: Store ATS analysis permanently ---
        const userEmail = profile?.email || localStorage.getItem('userEmail');
        if (userEmail) {
          const atsDataKey = `atsData_${userEmail}`;
          const newAtsData = {
            id: Date.now(),
            uploadedAt: Date.now(),
            fileName: file.name,
            skills: data.data.skills || [],
            experience: data.data.experience || [],
            projects: data.data.projects || [],
            education: data.data.education || [],
            score: data.data.score || 0,
            feedback: data.data.feedback || {}
          };
          localStorage.setItem(atsDataKey, JSON.stringify(newAtsData));
          console.log("Saved ATS data:", newAtsData);
        }
        
        // Send Email Notification
        const emailSent = await sendEmailNotification(
          "resume_upload",
          "Resume Uploaded & Analyzed - AI Career Platform",
          {
            filename: file.name,
            atsScore: data.data.score || 0,
            skills: data.data.skills || []
          }
        );

        if (!emailSent) {
          alert("Resume uploaded successfully, but email notification failed to send.");
        }
        
        logActivity({
          type: "resume_upload",
          title: "Resume Uploaded",
          description: "Your resume was uploaded successfully",
          status: "success"
        });

        if (data.data.score) {
          logActivity({
            type: "ats_analysis",
            title: "ATS Analysis Complete",
            description: `Generated score: ${data.data.score}`,
            status: "info"
          });

          if (data.data.score < 60) {
            logActivity({
              type: "ats_low_score_warning",
              title: "Low ATS Score",
              description: "Your resume needs improvement",
              status: "warning"
            });
          }
        }

        navigate('/profile');
      } else {
        alert("Upload failed. Please try again or check backend connection.");
      }
    } catch (error) {
      console.error("Resume Upload Error:", error);
      alert("Network error: Failed to connect to server.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Resume Upload</h1>
          <p className="text-gray-500 mt-1 max-w-lg leading-relaxed">Upload your latest resume to automatically extract your experiences, analyze ATS compatibility, and unlock highly personalized interview mock sessions.</p>
        </div>

        {profile && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-4 rounded-lg flex justify-between items-center dark:bg-indigo-900/20 dark:border-indigo-800/50 dark:text-indigo-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-500" />
              <p className="font-medium text-sm">You already have a synced profile. Uploading a new resume will safely overwrite it.</p>
            </div>
            <Link 
              to="/profile" 
              className="px-8 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center shrink-0"
            >
              View Profile
            </Link>
          </div>
        )}

        <Card className="flex flex-col items-center justify-center p-8 relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
          <div 
            className={`w-full h-80 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-[1.01] ${
              dragActive ? 'border-primary bg-indigo-500/10' : 'border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center mb-4">
                  <File className="w-10 h-10 text-indigo-600" />
                </div>
                <p className="font-bold text-gray-900 dark:text-white text-lg">{file.name}</p>
                <p className="text-sm font-medium text-gray-500 mb-6 drop-shadow-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <Button variant="secondary" className="border shadow-sm text-sm" onClick={() => setFile(null)}>Remove File</Button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center pointer-events-none">
                <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                  <UploadCloud className="w-10 h-10 text-indigo-500 pointer-events-auto" />
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">Drag & drop your resume here</p>
                <p className="text-sm font-medium text-gray-500 mb-6">Supports PDF, DOCX, or TXT up to 5MB</p>
                <label htmlFor="file-upload" className="pointer-events-auto">
                  <Button as="span" className="cursor-pointer shadow-md bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 hover:-translate-y-0.5 transition-transform" onClick={(e) => {
                    if (isDemo) {
                      e.preventDefault();
                      window.location.href = '/login';
                    }
                  }}>Browse Local Files</Button>
                </label>
                <input id="file-upload" type="file" className="hidden pointer-events-auto" onChange={handleFileChange} />
              </div>
            )}
          </div>
        </Card>

        {file && (
          <div className="flex justify-end gap-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <Button variant="secondary" className="border-2 hover:bg-gray-50 transition-colors" onClick={() => setFile(null)}>Cancel Upload</Button>
            <button 
              onClick={handleAnalyze} 
              disabled={isUploading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:-translate-y-0"
            >
              {isUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : 'Analyze Resume'}
            </button>
          </div>
        )}

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-sm">
          <div className="flex gap-4 items-start">
            <AlertCircle className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Why upload your resume?</h4>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                Our AI engine extracts your skills, experience, and education to generate hyper-personalized mock interviews and role matches. Over 90% of our premium users see better interview results after uploading their most up-to-date resume.
              </p>
            </div>
          </div>
        </Card>
      </div>
  );
}
