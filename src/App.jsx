import React, { useState } from 'react';
import './index.css';
import UploadArea from './components/UploadArea';
import RoastResults from './components/RoastResults';

function App() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="app-wrapper">
      <nav className="container">
        <div className="logo" onClick={() => setResults(null)}>
          <span className="gradient-text">RoastMyResume.ai</span>
        </div>
      </nav>

      <main className="container hero-section">
        {!results ? (
          <>
            <div className="hero-content">
              <h1 className="title">
                Your Resume is Probably <span className="gradient-text">Terrible.</span>
              </h1>
              <p className="subtitle">
                Let our brutal AI roast it. Get an honest ATS score, find out exactly why you're getting rejected, and learn how to fix it before your next application.
              </p>
            </div>
            
            <div className="upload-container animate-float">
              {isLoading ? (
                <div className="loading-state glass-panel">
                  <div className="spinner"></div>
                  <p className="loading-text">The AI is analyzing your failures... prepare to be roasted.</p>
                </div>
              ) : (
                <UploadArea onResults={setResults} setLoading={setIsLoading} />
              )}
            </div>
          </>
        ) : (
          <RoastResults data={results} onShare={() => alert('Viral Loop Triggered! In real app, this redirects to LinkedIn, then unlocks tips on return.')} />
        )}
      </main>

      <style jsx="true">{`
        .app-wrapper { min-height: 100vh; display: flex; flex-direction: column; }
        nav { padding-top: 2rem; padding-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-family: var(--font-display); font-size: 1.8rem; font-weight: 900; letter-spacing: -0.5px; cursor: pointer; transition: opacity 0.2s; }
        .logo:hover { opacity: 0.8; }
        .hero-section { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; text-align: center; padding-top: 2rem; padding-bottom: 6rem; }
        .hero-content { max-width: 800px; margin-bottom: 4rem; }
        .title { font-size: 5rem; line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -1.5px; }
        .subtitle { font-size: 1.3rem; color: var(--text-secondary); line-height: 1.6; max-width: 650px; margin: 0 auto; }
        .upload-container { width: 100%; max-width: 700px; }
        
        .loading-state { padding: 4rem; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 24px;}
        .spinner { width: 50px; height: 50px; border: 4px solid rgba(139, 92, 246, 0.3); border-top-color: var(--accent-color); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1.5rem; }
        .loading-text { font-size: 1.2rem; color: var(--text-primary); font-weight: 600; }
        
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .title { font-size: 3.5rem; letter-spacing: -1px; }
          .hero-section { padding-top: 1rem; }
          .subtitle { font-size: 1.1rem; }
        }
      `}</style>
    </div>
  );
}

export default App;
