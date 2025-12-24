import React from 'react';
import Link from 'next/link';

export default function AnimationPreviews() {
  return (
    <>
      <style jsx>{`
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .title {
          color: white;
          font-size: 48px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 20px;
          text-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        
        .subtitle {
          color: rgba(255,255,255,0.9);
          font-size: 20px;
          text-align: center;
          margin-bottom: 50px;
          max-width: 600px;
        }
        
        .cards-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
          max-width: 1200px;
          width: 100%;
        }
        
        .card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          display: block;
        }
        
        .card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 50px rgba(0,0,0,0.3);
        }
        
        .card-icon {
          font-size: 80px;
          text-align: center;
          margin-bottom: 20px;
        }
        
        .card-title {
          font-size: 28px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 15px;
          color: #333;
        }
        
        .card-description {
          font-size: 16px;
          color: #666;
          text-align: center;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        
        .card-features {
          list-style: none;
          padding: 0;
          margin: 20px 0;
        }
        
        .card-features li {
          padding: 8px 0;
          border-bottom: 1px solid #eee;
          color: #555;
          font-size: 14px;
        }
        
        .card-features li:last-child {
          border-bottom: none;
        }
        
        .card-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 30px;
          border-radius: 30px;
          text-align: center;
          font-weight: bold;
          margin-top: 20px;
          transition: opacity 0.3s ease;
        }
        
        .card:hover .card-button {
          opacity: 0.9;
        }
        
        .info-box {
          background: rgba(255,255,255,0.95);
          border-radius: 15px;
          padding: 30px;
          max-width: 800px;
          margin-top: 40px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        
        .info-box h3 {
          color: #764ba2;
          margin-bottom: 15px;
          font-size: 24px;
        }
        
        .info-box p {
          color: #555;
          line-height: 1.8;
          margin-bottom: 10px;
        }
        
        .info-box code {
          background: #f5f5f5;
          padding: 2px 8px;
          border-radius: 4px;
          font-family: monospace;
          color: #764ba2;
        }
        
        @media (max-width: 768px) {
          .title {
            font-size: 32px;
          }
          
          .subtitle {
            font-size: 16px;
          }
          
          .cards-container {
            grid-template-columns: 1fr;
          }
          
          .card {
            padding: 30px 20px;
          }
        }
      `}</style>

      <div className="container">
        <h1 className="title">🎉 Animations-Previews 🎉</h1>
        <p className="subtitle">
          Testen Sie beide Animationen ohne Veröffentlichung auf der Live-Seite!
        </p>

        <div className="cards-container">
          {/* Weihnachts-Animation */}
          <Link href="/preview-christmas" className="card">
            <div className="card-icon">🎅❄️🎄</div>
            <h2 className="card-title">Weihnachts-Animation</h2>
            <p className="card-description">
              Weihnachtsmann fliegt mit Schweinen-Rentieren über den Bildschirm, 
              begleitet von fallenden Schneeflocken
            </p>
            <ul className="card-features">
              <li>🎅 Weihnachtsmann: Kontinuierliche Dauerschleife (15s)</li>
              <li>❄️ Schneeflocken: Alle 30s für 5 Sekunden</li>
              <li>📅 Aktiv: KW 51 (15.-19.12.) & KW 52 (23.-29.12.)</li>
              <li>📱 Voll responsive (Desktop & Mobil)</li>
            </ul>
            <div className="card-button">
              🎅 Preview ansehen →
            </div>
          </Link>

          {/* Neujahrs-Animation */}
          <Link href="/preview-newyear" className="card">
            <div className="card-icon">🎆🐷🍀</div>
            <h2 className="card-title">Silvester-Animation (PNG)</h2>
            <p className="card-description">
              3-Phasen-Animation mit PNG-Bildern: Rakete fliegt, explodiert als Feuerwerk, 
              2026 fällt mit Glücksklee-Fallschirm
            </p>
            <ul className="card-features">
              <li>🚀 Phase 1: Schweinchen auf Rakete (3s)</li>
              <li>💥 Phase 2: Feuerwerk-Bild (2s)</li>
              <li>🍀 Phase 3: 10x 2026 mit Fallschirm (8s)</li>
              <li>📅 Aktiv: KW 1 (Woche mit 1. Januar)</li>
            </ul>
            <div className="card-button">
              🎆 PNG-Version →
            </div>
          </Link>

          {/* Neujahrs-Animation mit anime.js */}
          <Link href="/preview-newyear-anime" className="card" style={{ border: '3px solid #FFD700' }}>
            <div className="card-icon">✨🎆💫</div>
            <h2 className="card-title">Silvester mit anime.js 🆕</h2>
            <p className="card-description">
              Professionelle Animation mit anime.js Library: 
              Smooth Rakete, echtes Partikel-Feuerwerk, animierter 2026-Konfetti
            </p>
            <ul className="card-features">
              <li>✨ Smooth anime.js Easing</li>
              <li>💥 Echtes Partikel-Feuerwerk (80 Partikel)</li>
              <li>🎊 Animierter 2026-Text-Konfetti</li>
              <li>🚀 Keine PNG-Hintergründe mehr!</li>
              <li>⚡ Performance-optimiert</li>
            </ul>
            <div className="card-button" style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' }}>
              ✨ anime.js Version (NEU!) →
            </div>
          </Link>
        </div>

        <div className="info-box">
          <h3>ℹ️ Hinweise zu den Previews</h3>
          <p>
            <strong>Diese Seiten sind NUR zum Testen!</strong> Sie zeigen die Animationen 
            ohne dass ein Speiseplan veröffentlicht werden muss.
          </p>
          <p>
            <strong>Live-Aktivierung:</strong> Auf der echten Webseite werden die Animationen 
            automatisch angezeigt, wenn ein Speiseplan für die entsprechende Woche veröffentlicht ist.
          </p>
          <p>
            <strong>URLs:</strong>
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li><code>/preview-christmas</code> - Weihnachts-Animation</li>
            <li><code>/preview-newyear</code> - Silvester-Animation</li>
            <li><code>/preview-animations</code> - Diese Übersicht</li>
          </ul>
          <p style={{ marginTop: '20px' }}>
            <strong>Technische Details:</strong> Die Preview-Seiten verwenden exakt denselben 
            Code wie die Live-Animationen, nur ohne Speiseplan-Prüfung.
          </p>
        </div>
      </div>
    </>
  );
}
