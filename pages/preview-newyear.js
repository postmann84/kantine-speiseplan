import React, { useState, useEffect } from 'react';

export default function PreviewNewYear() {
  const [newYearPhase, setNewYearPhase] = useState(1);

  useEffect(() => {
    // Starte die Animation automatisch beim Laden
    startNewYearAnimation();
  }, []);

  const startNewYearAnimation = () => {
    // Phase 1: Rakete fliegt diagonal (3 Sekunden)
    setNewYearPhase(1);
    
    setTimeout(() => {
      // Phase 2: Explosion/Feuerwerk (2 Sekunden)
      setNewYearPhase(2);
      
      setTimeout(() => {
        // Phase 3: VIELE 2026er fallen (8 Sekunden)
        setNewYearPhase(3);
        
        setTimeout(() => {
          // Zurück zu Phase 1 und wiederholen
          startNewYearAnimation();
        }, 8000);
      }, 2000);
    }, 3000);
  };

  return (
    <>
      <style jsx>{`
        .preview-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .preview-title {
          position: absolute;
          top: 30px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 32px;
          font-weight: bold;
          text-align: center;
          z-index: 10000;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        
        .preview-info {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255,255,255,0.95);
          padding: 20px 30px;
          border-radius: 15px;
          color: #333;
          font-size: 16px;
          text-align: center;
          z-index: 10000;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          max-width: 600px;
        }
        
        .phase-indicator {
          position: absolute;
          top: 100px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255,255,255,0.9);
          padding: 10px 20px;
          border-radius: 25px;
          color: #764ba2;
          font-weight: bold;
          font-size: 18px;
          z-index: 10000;
        }
        
        /* Phase 1: Rakete fliegt diagonal von links unten nach rechts oben */
        @keyframes rocketFly {
          0% {
            left: -300px;
            bottom: -200px;
            transform: rotate(-45deg);
          }
          100% {
            left: 100%;
            bottom: 80%;
            transform: rotate(-45deg);
          }
        }
        
        /* Phase 2: Explosion/Feuerwerk erscheint */
        @keyframes explode {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(360deg);
            opacity: 1;
          }
        }
        
        /* Phase 3: Viele 2026er fallen wie Schneeflocken */
        @keyframes fallDown {
          0% {
            top: -200px;
            transform: translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            top: 110vh;
            transform: translateX(var(--drift)) rotate(var(--rotation));
            opacity: 1;
          }
        }
        
        /* Sanftes Schwingen beim Fallen */
        @keyframes swing {
          0%, 100% {
            transform: rotate(-3deg);
          }
          50% {
            transform: rotate(3deg);
          }
        }
        
        .newyear-container {
          position: fixed;
          z-index: 9997;
          pointer-events: none;
        }
        
        /* Phase 1: Rakete */
        .rocket-phase {
          bottom: -200px;
          left: -300px;
          animation: rocketFly 3s ease-out forwards;
        }
        
        .rocket-img {
          height: 250px;
          width: auto;
          mix-blend-mode: multiply;
          filter: brightness(1.1);
        }
        
        /* Phase 2: Explosion - oben rechts wo Rakete ankommt */
        .explosion-phase {
          right: 5%;
          top: 15%;
        }
        
        .explosion-img {
          width: 600px;
          height: auto;
          animation: explode 2s ease-out forwards;
          /* PNG hat jetzt echte Transparenz! */
        }
        
        /* Phase 3: Viele 2026er Container */
        .falling-phase-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9997;
          overflow: hidden;
        }
        
        .year-item {
          position: absolute;
          top: -200px;
          animation: fallDown var(--duration) ease-in forwards;
          animation-delay: var(--delay);
        }
        
        .year-img {
          height: var(--size);
          width: auto;
          animation: swing 2s ease-in-out infinite;
          /* PNG hat jetzt echte Transparenz! */
        }
        
        .year-item:nth-child(1) { left: 10%; --size: 180px; --duration: 8s; --delay: 0s; --drift: 30px; --rotation: 5deg; }
        .year-item:nth-child(2) { left: 25%; --size: 220px; --duration: 10s; --delay: 0.5s; --drift: -20px; --rotation: -8deg; }
        .year-item:nth-child(3) { left: 40%; --size: 200px; --duration: 9s; --delay: 1s; --drift: 40px; --rotation: 12deg; }
        .year-item:nth-child(4) { left: 55%; --size: 190px; --duration: 11s; --delay: 0.3s; --drift: -30px; --rotation: -5deg; }
        .year-item:nth-child(5) { left: 70%; --size: 210px; --duration: 8.5s; --delay: 0.8s; --drift: 25px; --rotation: 8deg; }
        .year-item:nth-child(6) { left: 85%; --size: 195px; --duration: 10.5s; --delay: 0.2s; --drift: -35px; --rotation: -10deg; }
        .year-item:nth-child(7) { left: 15%; --size: 205px; --duration: 9.5s; --delay: 1.2s; --drift: 20px; --rotation: 6deg; }
        .year-item:nth-child(8) { left: 50%; --size: 215px; --duration: 10s; --delay: 0.6s; --drift: -25px; --rotation: -7deg; }
        .year-item:nth-child(9) { left: 35%; --size: 185px; --duration: 8.8s; --delay: 1.5s; --drift: 35px; --rotation: 9deg; }
        .year-item:nth-child(10) { left: 80%; --size: 200px; --duration: 9.2s; --delay: 0.4s; --drift: -20px; --rotation: -6deg; }
        
        @media (max-width: 768px) {
          .preview-title {
            font-size: 24px;
            top: 20px;
          }
          
          .preview-info {
            font-size: 14px;
            padding: 15px 20px;
            bottom: 20px;
            max-width: 90%;
          }
          
          .rocket-img {
            height: 150px;
          }
          
          .explosion-img {
            width: 400px;
          }
          
          .year-item:nth-child(n) {
            --size: 120px !important;
          }
        }
      `}</style>

      <div className="preview-container">
        <div className="preview-title">
          🎆 Silvester/Neujahrs-Animation Preview 🎆
        </div>
        
        <div className="phase-indicator">
          {newYearPhase === 1 && '🚀 Phase 1: Rakete fliegt diagonal'}
          {newYearPhase === 2 && '💥 Phase 2: Explosion!'}
          {newYearPhase === 3 && '🍀 Phase 3: VIELE 2026er fallen!'}
        </div>
        
        <div className="preview-info">
          <strong>Timeline:</strong><br/>
          Phase 1 (3s): Rakete fliegt diagonal nach oben 🚀<br/>
          Phase 2 (2s): Feuerwerk explodiert oben rechts 💥<br/>
          Phase 3 (8s): VIELE 2026er fallen wie Schneeflocken 🍀<br/>
          <br/>
          <em>Animation läuft als Endlosschleife (13s pro Durchlauf)</em>
        </div>

        {/* Phase 1: Rakete fliegt diagonal */}
        {newYearPhase === 1 && (
          <div className="newyear-container rocket-phase">
            <img 
              src="/newyear-rocket.png" 
              alt="Schweinchen auf Rakete"
              className="rocket-img"
            />
          </div>
        )}
        
        {/* Phase 2: Explosion/Feuerwerk oben rechts */}
        {newYearPhase === 2 && (
          <div className="newyear-container explosion-phase">
            <img 
              src="/newyear-firework.png" 
              alt="Silvester Feuerwerk"
              className="explosion-img"
            />
          </div>
        )}
        
        {/* Phase 3: VIELE 2026er fallen */}
        {newYearPhase === 3 && (
          <div className="falling-phase-container">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="year-item">
                <img src="/newyear-2026.png" alt="2026" className="year-img" />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
