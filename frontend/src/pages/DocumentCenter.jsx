import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserContext } from '../contexts/UserContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { FileText, UploadCloud, Trash2, ShieldCheck, Download, Plus, Search, Filter } from 'lucide-react';
import { logActivity } from '../utils/activityLogger';

export default function DocumentCenter() {
  const { profile } = useContext(UserContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  const tabs = ['All', 'Resume', 'Certificate', 'Identity', 'Other'];

  const fetchDocuments = async () => {
    try {
      const email = profile?.email || localStorage.getItem('userEmail');
      if (!email) {
          setLoading(false);
          return;
      }
      setLoading(true);
      const response = await fetch(`http://localhost:8000/documents/list/${email}`);
      const result = await response.json();
      if (result.success) {
        setDocuments(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch docs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.email || localStorage.getItem('userEmail')) {
      fetchDocuments();
    }
  }, [profile]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const email = profile?.email || localStorage.getItem('userEmail');
    if (!email) {
        alert("Please login first");
        return;
    }

    const formData = new FormData();
    formData.append('user_id', email);
    // Auto-categorize based on active tab or file type heuristically
    formData.append('category', activeTab === 'All' ? 'Other' : activeTab); 
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await fetch('http://localhost:8000/documents/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setDocuments([...documents, result.data]);
        logActivity({
          type: "document_upload",
          title: "Document Uploaded",
          description: `Uploaded ${file.name}`,
          status: "success"
        });
      } else {
          alert("Failed to upload: " + (result.detail || "Unknown error"));
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload document");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    const email = profile?.email || localStorage.getItem('userEmail');
    try {
      const response = await fetch(`http://localhost:8000/documents/${email}/${docId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        setDocuments(documents.filter(d => d.id !== docId));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const getDocIcon = (category) => {
      switch(category) {
          case 'Resume': return <FileText className="w-8 h-8 text-blue-500" />;
          case 'Certificate': return <ShieldCheck className="w-8 h-8 text-green-500" />;
          default: return <FileText className="w-8 h-8 text-gray-400" />;
      }
  };

  const formatSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocs = documents.filter(doc => {
      if (activeTab !== 'All' && doc.category !== activeTab) return false;
      if (searchQuery && !doc.original_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-poppins">Document Center</h1>
          <p className="text-gray-500 font-medium mt-1 font-inter">Securely manage your resumes, certificates, and career documents.</p>
        </div>
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            className="hidden" 
            accept=".pdf,.docx,.jpg,.jpeg,.png"
          />
          <Button 
            onClick={() => fileInputRef.current.click()} 
            disabled={uploading}
            className="bg-[#FF6B00] hover:bg-[#E65C00] text-white shadow-md shadow-[#FF6B00]/20 flex items-center gap-2 border-0"
          >
            {uploading ? (
              <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Uploading...</span>
            ) : (
              <span className="flex items-center gap-2"><UploadCloud className="w-4 h-4" /> Upload Document</span>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex overflow-x-auto pb-2 md:pb-0 hide-scrollbar gap-2 w-full md:w-auto">
              {tabs.map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-[#FF6B00]/10 text-[#FF6B00]' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                      {tab}
                  </button>
              ))}
          </div>
          <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                  type="text" 
                  placeholder="Search documents..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/50"
              />
          </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 bg-gray-100 dark:bg-gray-900 animate-pulse rounded-xl"></div>
            ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <Card className="text-center py-20 border-2 border-dashed">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-poppins">No documents found</h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-6 font-inter text-sm">You haven't uploaded any {activeTab !== 'All' ? activeTab.toLowerCase() + 's' : 'documents'} yet.</p>
            <Button onClick={() => fileInputRef.current.click()} variant="outline" className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/5">
                Upload your first document
            </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredDocs.map(doc => (
                <Card key={doc.id} className="relative group hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button onClick={() => handleDelete(doc.id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="flex flex-col items-center text-center p-4">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4">
                            {getDocIcon(doc.category)}
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate w-full" title={doc.original_name}>
                            {doc.original_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full font-medium">{doc.category}</span>
                            <span>•</span>
                            <span>{formatSize(doc.size)}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                            Added {new Date(doc.uploaded_at).toLocaleDateString()}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
      )}
    </div>
  );
}
