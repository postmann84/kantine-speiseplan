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
        
        /* Phase 1: Rakete fliegt von links nach rechts */
        @keyframes rocketFly {
          0% {
            left: -300px;
            transform: rotate(-15deg);
          }
          100% {
            left: 100%;
            transform: rotate(-15deg);
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
        
        /* Phase 3: 2026 fällt mit Fallschirm runter */
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
            transform: translateX(50px) rotate(10deg);
            opacity: 1;
          }
        }
        
        /* Sanftes Schwingen */
        @keyframes swing {
          0%, 100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }
        
        .newyear-container {
          position: fixed;
          z-index: 9997;
          pointer-events: none;
        }
        
        /* Phase 1: Rakete */
        .rocket-phase {
          bottom: 30%;
          left: -300px;
          animation: rocketFly 5s linear forwards;
        }
        
        .rocket-img {
          height: 250px;
          width: auto;
          /* Entferne grauen Hintergrund mit Mix-Blend-Mode */
          mix-blend-mode: multiply;
          filter: brightness(1.1);
        }
        
        /* Phase 2: Explosion */
        .explosion-phase {
          left: 50%;
          top: 40%;
          transform: translate(-50%, -50%);
        }
        
        .explosion-img {
          width: 600px;
          height: auto;
          animation: explode 2s ease-out forwards;
        }
        
        /* Phase 3: 2026 Fallschirm */
        .falling-phase {
          left: 50%;
          top: -200px;
          transform: translateX(-50%);
          animation: fallDown 5s ease-in forwards;
        }
        
        .year-img {
          height: 300px;
          width: auto;
          animation: swing 2s ease-in-out infinite;
        }
        
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
          
          .year-img {
            height: 200px;
          }
        }
      `}</style>

      <div className="preview-container">
        <div className="preview-title">
          🎆 Silvester/Neujahrs-Animation Preview 🎆
        </div>
        
        <div className="phase-indicator">
          {newYearPhase === 1 && '🚀 Phase 1: Rakete fliegt'}
          {newYearPhase === 2 && '💥 Phase 2: Explosion!'}
          {newYearPhase === 3 && '🍀 Phase 3: 2026 fällt'}
        </div>
        
        <div className="preview-info">
          <strong>Timeline:</strong><br/>
          Phase 1 (5s): Schweinchen auf Rakete fliegt 🚀<br/>
          Phase 2 (2s): Feuerwerk explodiert 💥<br/>
          Phase 3 (5s): 2026 mit Glücksklee-Fallschirm fällt 🍀<br/>
          <br/>
          <em>Animation läuft als Endlosschleife (12s pro Durchlauf)</em>
        </div>

        {/* Phase 1: Rakete fliegt */}
        {newYearPhase === 1 && (
          <div className="newyear-container rocket-phase">
            <img 
              src="/newyear-rocket.png" 
              alt="Schweinchen auf Rakete"
              className="rocket-img"
            />
          </div>
        )}
        
        {/* Phase 2: Explosion/Feuerwerk */}
        {newYearPhase === 2 && (
          <div className="newyear-container explosion-phase">
            <img 
              src="/newyear-firework.png" 
              alt="Silvester Feuerwerk"
              className="explosion-img"
            />
          </div>
        )}
        
        {/* Phase 3: 2026 fällt mit Fallschirm */}
        {newYearPhase === 3 && (
          <div className="newyear-container falling-phase">
            <img 
              src="/newyear-2026.png" 
              alt="2026 mit Glücksklee-Fallschirm"
              className="year-img"
            />
          </div>
        )}
      </div>
    </>
  );
}
