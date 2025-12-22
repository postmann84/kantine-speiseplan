import React, { useState, useEffect } from 'react';

export default function PreviewChristmas() {
  const [showSnowflakes, setShowSnowflakes] = useState(false);

  useEffect(() => {
    // Starte Schneeflocken-Intervall
    startSnowflakeInterval();
  }, []);

  const startSnowflakeInterval = () => {
    // Erste Schneeflocken nach 5 Sekunden
    setTimeout(() => {
      setShowSnowflakes(true);
      setTimeout(() => setShowSnowflakes(false), 5000); // 5 Sekunden lang
    }, 5000);

    // Dann alle 30 Sekunden wiederholen
    setInterval(() => {
      setShowSnowflakes(true);
      setTimeout(() => setShowSnowflakes(false), 5000); // 5 Sekunden lang
    }, 30000); // Alle 30 Sekunden
  };

  return (
    <>
      <style jsx>{`
        .preview-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%);
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
        
        /* Weihnachtsmann fliegt von links nach rechts */
        @keyframes santaFly {
          0% {
            left: -200px;
          }
          100% {
            left: 100%;
          }
        }
        
        .santa-container {
          position: fixed;
          bottom: 20%;
          left: -200px;
          z-index: 9999;
          pointer-events: none;
          animation: santaFly 15s linear infinite;
        }
        
        .santa-video {
          height: 240px;
          width: auto;
          background: transparent !important;
        }
        
        /* Schneeflocken */
        @keyframes snowfall {
          0% {
            transform: translateY(-10vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) translateX(var(--drift));
            opacity: 0;
          }
        }
        
        .snowflake-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9998;
          overflow: hidden;
        }
        
        .snowflake {
          position: absolute;
          color: white;
          font-size: var(--size);
          animation: snowfall var(--duration) linear infinite;
          animation-delay: var(--delay);
          text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
          opacity: 0.9;
          user-select: none;
        }
        
        .snowflake:nth-child(1) { --size: 20px; --duration: 8s; --delay: 0s; left: 5%; --drift: 30px; }
        .snowflake:nth-child(2) { --size: 16px; --duration: 10s; --delay: 1s; left: 15%; --drift: -20px; }
        .snowflake:nth-child(3) { --size: 24px; --duration: 12s; --delay: 0.5s; left: 25%; --drift: 40px; }
        .snowflake:nth-child(4) { --size: 18px; --duration: 9s; --delay: 2s; left: 35%; --drift: -30px; }
        .snowflake:nth-child(5) { --size: 22px; --duration: 11s; --delay: 1.5s; left: 45%; --drift: 25px; }
        .snowflake:nth-child(6) { --size: 16px; --duration: 10s; --delay: 0.8s; left: 55%; --drift: -35px; }
        .snowflake:nth-child(7) { --size: 20px; --duration: 13s; --delay: 2.5s; left: 65%; --drift: 20px; }
        .snowflake:nth-child(8) { --size: 18px; --duration: 9s; --delay: 1.2s; left: 75%; --drift: -25px; }
        .snowflake:nth-child(9) { --size: 24px; --duration: 11s; --delay: 0.3s; left: 85%; --drift: 35px; }
        .snowflake:nth-child(10) { --size: 16px; --duration: 10s; --delay: 1.8s; left: 95%; --drift: -20px; }
        .snowflake:nth-child(11) { --size: 20px; --duration: 12s; --delay: 0.6s; left: 10%; --drift: 28px; }
        .snowflake:nth-child(12) { --size: 18px; --duration: 9s; --delay: 2.2s; left: 30%; --drift: -32px; }
        .snowflake:nth-child(13) { --size: 22px; --duration: 11s; --delay: 1.1s; left: 50%; --drift: 22px; }
        .snowflake:nth-child(14) { --size: 16px; --duration: 10s; --delay: 1.6s; left: 70%; --drift: -28px; }
        .snowflake:nth-child(15) { --size: 24px; --duration: 13s; --delay: 0.9s; left: 90%; --drift: 38px; }
        
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
          
          .santa-video {
            height: 160px;
          }
          
          .santa-container {
            bottom: 10%;
          }
        }
      `}</style>

      <div className="preview-container">
        <div className="preview-title">
          🎅 Weihnachts-Animation Preview 🎄
        </div>
        
        <div className="preview-info">
          <strong>Animationen:</strong><br/>
          🎅 <strong>Weihnachtsmann:</strong> Fliegt kontinuierlich von links nach rechts (15s pro Durchlauf)<br/>
          ❄️ <strong>Schneeflocken:</strong> Erscheinen alle 30 Sekunden für 5 Sekunden<br/>
          <br/>
          <em>Erste Schneeflocken nach 5 Sekunden Wartezeit</em>
        </div>

        {/* Weihnachtsmann fliegt kontinuierlich */}
        <div className="santa-container">
          <video 
            className="santa-video"
            autoPlay 
            loop 
            muted
            playsInline
            style={{ background: 'transparent' }}
          >
            <source src="/santa-animation.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Schneeflocken (alle 30 Sekunden für 5 Sekunden) */}
        {showSnowflakes && (
          <div className="snowflake-container">
            <div className="snowflake">❄</div>
            <div className="snowflake">❅</div>
            <div className="snowflake">❆</div>
            <div className="snowflake">❄</div>
            <div className="snowflake">❅</div>
            <div className="snowflake">❆</div>
            <div className="snowflake">❄</div>
            <div className="snowflake">❅</div>
            <div className="snowflake">❆</div>
            <div className="snowflake">❄</div>
            <div className="snowflake">❅</div>
            <div className="snowflake">❆</div>
            <div className="snowflake">❄</div>
            <div className="snowflake">❅</div>
            <div className="snowflake">❆</div>
          </div>
        )}
      </div>
    </>
  );
}
