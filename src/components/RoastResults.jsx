import React, { useState } from 'react';
import { rewriteResume } from '../lib/gemini';

export default function RoastResults({ data, onShare }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [fixedResume, setFixedResume] = useState(null);

  if (!data) return null;

  const generatePremiumResume = async () => {
    setIsFixing(true);
    // Deliberately NOT setting fixedResume to null here so we don't lose it if the API fails!
    try {
      const fixed = await rewriteResume(data.originalText);
      setFixedResume(fixed);
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setIsFixing(false);
    }
  };

  const handlePayment = async () => {
    alert('Simulating Checkout... Payment Successful! We collected $5.');
    await generatePremiumResume();
  };

  if (fixedResume) {
    return (
      <div className="results-container animate-float">
        <div className="glass-panel print-container" style={{ padding: '4rem', textAlign: 'left' }}>
          <h2 className="no-print" style={{color: '#10b981', marginBottom: '2rem', textAlign: 'center'}}>✨ Your $5 Premium Resume</h2>
          
          <div className="no-print" style={{backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid rgba(16, 185, 129, 0.5)', color: '#34d399', textAlign: 'center'}}>
            <strong>Pro Tip:</strong> Click anywhere on the text below to edit it (like filling in brackets or missing names) before saving as PDF!
          </div>

          <div 
            className="print-text premium-resume" 
            dangerouslySetInnerHTML={{ __html: fixedResume }} 
            style={{ 
              outline: 'none',
              opacity: isFixing ? 0.5 : 1,
              transition: 'opacity 0.3s'
            }} 
            contentEditable={!isFixing}
            suppressContentEditableWarning={true}
          />
          
          <div className="no-print" style={{textAlign: 'center', marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
            <button className="btn-primary" onClick={() => window.print()} disabled={isFixing}>
              Save as PDF
            </button>
            <button className="btn-secondary" onClick={generatePremiumResume} disabled={isFixing}>
              {isFixing ? 'Regenerating...' : 'Regenerate with AI'}
            </button>
          </div>
        </div>
        <style jsx="true">{`
          .results-container { width: 100%; max-width: 800px; margin: 0 auto; }
          .btn-secondary { background: transparent; border: 2px solid #10b981; color: #10b981; padding: 0.8rem 2rem; border-radius: 9999px; font-weight: 600; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; font-family: var(--font-main); }
          .btn-secondary:hover:not(:disabled) { background: rgba(16, 185, 129, 0.1); transform: translateY(-2px); }
          .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
          .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="results-container animate-float">
      <div className="score-card glass-panel">
        <h2>Your ATS Viability Score</h2>
        <div className={`score ${data.score < 50 ? 'bad' : data.score < 80 ? 'okay' : 'good'}`}>{data.score}<span>/100</span></div>
        <p className="verdict">{data.score < 50 ? "Yikes. Straight to the trash." : data.score < 80 ? "Mediocre. You'll blend right in with the rejects." : "Actually... not terrible. But we can make it better."}</p>
      </div>

      <div className="roast-card glass-panel">
        <h3>🔥 The Roast</h3>
        <div className={`roast-content ${isUnlocked ? 'unlocked' : ''}`} dangerouslySetInnerHTML={{ __html: data.roast }}></div>
        
        {!isUnlocked && (
          <div className="unlock-overlay">
            <div className="unlock-content">
              <h4>Want to read the full roast & fix it?</h4>
              <p>Share your terrible score to unlock the AI's feedback!</p>
              <button className="btn-primary" onClick={() => { onShare(); setIsUnlocked(true); }}>Share on LinkedIn to Unlock</button>
            </div>
          </div>
        )}
        
        {isUnlocked && (
          <div className="tips-section mt-4">
            <h3>💡 How to Fix It (Free Tips)</h3>
            <ul className="tips-list">{data.tips.map((tip, idx) => (<li key={idx} dangerouslySetInnerHTML={{ __html: tip }}></li>))}</ul>
            <div className="premium-upsell mt-4">
              <h4>Too lazy to fix it yourself?</h4>
              {isFixing ? (
                <p style={{color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem'}}>✨ The AI is working its magic... Please wait...</p>
              ) : (
                <button className="btn-primary premium-btn" onClick={handlePayment}>Let AI Rewrite It Perfectly For $5</button>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .results-container { width: 100%; max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; }
        .score-card { padding: 3rem; text-align: center; }
        .score { font-size: 6rem; font-weight: 900; font-family: var(--font-display); line-height: 1; margin: 1rem 0; }
        .score span { font-size: 2rem; color: var(--text-secondary); }
        .score.bad { color: #ef4444; text-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
        .score.okay { color: #eab308; text-shadow: 0 0 20px rgba(234, 179, 8, 0.4); }
        .score.good { color: #22c55e; text-shadow: 0 0 20px rgba(34, 197, 94, 0.4); }
        .verdict { font-size: 1.2rem; color: var(--text-secondary); font-weight: 500; }
        .roast-card { padding: 3rem; position: relative; overflow: hidden; }
        .roast-content { font-size: 1.1rem; line-height: 1.6; color: var(--text-primary); filter: blur(6px); opacity: 0.4; transition: all 0.5s ease; padding-bottom: 2rem;}
        .roast-content.unlocked { filter: blur(0); opacity: 1; padding-bottom: 1rem; }
        .unlock-overlay { position: absolute; inset: 0; background: rgba(9, 9, 11, 0.5); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; z-index: 10; border-radius: 24px; }
        .unlock-content { text-align: center; padding: 2.5rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); backdrop-filter: blur(20px); max-width: 400px; }
        .unlock-content h4 { font-size: 1.5rem; margin-bottom: 0.5rem; color: white; }
        .unlock-content p { color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.5;}
        .mt-4 { margin-top: 2rem; }
        .tips-section h3 { margin-bottom: 1rem; color: #fbbf24; }
        .tips-list { padding-left: 1.5rem; margin-bottom: 2rem; }
        .tips-list li { margin-bottom: 0.5rem; line-height: 1.5; color: var(--text-primary); }
        .premium-upsell { text-align: center; padding-top: 2rem; border-top: 1px solid var(--glass-border); }
        .premium-upsell h4 { margin-bottom: 1rem; font-size: 1.2rem; color: white; }
        .premium-btn { background: linear-gradient(135deg, #10b981 0%, #059669 100%); width: 100%; max-width: 400px; font-size: 1.2rem; padding: 1rem; border: none; cursor: pointer; color: white; border-radius: 9999px; transition: all 0.3s; }
        .premium-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3); }
      `}</style>
    </div>
  );
}
