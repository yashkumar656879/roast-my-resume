import React, { useState, useRef } from 'react';
import { roastResume } from '../lib/gemini';

export default function UploadArea({ onResults, setLoading }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  
  const processFile = (file) => {
    if (!file) return;
    
    if (file.type !== 'text/plain' && file.type !== 'application/pdf' && !file.name.endsWith('.txt') && !file.name.endsWith('.pdf')) {
      alert('Please upload a PDF or TXT file.');
      return;
    }

    setLoading(true);
    
    // Use FileReader to convert the file to a Base64 string so Gemini can read the PDF natively
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const dataUrl = reader.result;
        const base64 = dataUrl.split(',')[1];
        const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'text/plain');
        
        const fileData = { base64, mimeType };
        
        // Pass the file object to the AI
        const results = await roastResume(fileData);
        
        // Save the fileData in state so the Premium Rewrite feature can use the original PDF!
        onResults({ ...results, originalText: fileData });
      } catch (error) {
        alert('The AI failed to roast you: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setLoading(false);
      alert('Failed to read the file.');
    };
    
    // Read the file as a data URL to extract the base64 string
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };
  
  const handleChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  return (
    <div 
      className={`glass-panel upload-box ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".txt,.pdf" 
        onChange={handleChange}
      />
      <div className="upload-content">
        <div className="icon">🔥</div>
        <h3>Drop your Resume here</h3>
        <p>Supports .PDF and .TXT. Let the roasting begin.</p>
        <button className="btn-primary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
          Browse Files
        </button>
      </div>

      <style jsx="true">{`
        .upload-box { padding: 4rem 2rem; text-align: center; border: 2px dashed var(--glass-border); transition: all 0.3s ease; position: relative; overflow: hidden; cursor: pointer; border-radius: 24px;}
        .upload-box.dragging { border-color: var(--accent-color); background: rgba(139, 92, 246, 0.1); transform: scale(1.02); }
        .upload-box:hover { border-color: rgba(139, 92, 246, 0.5); }
        .upload-content { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .icon { font-size: 4.5rem; margin-bottom: 0.5rem; filter: drop-shadow(0 0 20px rgba(255,100,100,0.4)); }
        h3 { font-size: 1.8rem; margin-bottom: 0.5rem; color: white;}
        p { color: var(--text-secondary); margin-bottom: 2rem; font-size: 1.1rem; }
      `}</style>
    </div>
  );
}
