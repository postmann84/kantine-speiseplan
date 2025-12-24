import React, { useState, useEffect, useRef } from 'react';

export default function PreviewNewYearAnime() {
  const [phase, setPhase] = useState(1);
  const canvasRef = useRef(null);
  const rocketRef = useRef(null);
  const animeRef = useRef(null);

  useEffect(() => {
    // Dynamisch anime.js laden
    import('animejs').then(anime => {
      animeRef.current = anime.default;
      startAnimation();
    });
  }, []);

  const startAnimation = () => {
    if (!animeRef.current) return;
    
    setPhase(1);
    
    // Phase 1: Rakete fliegt (3s)
    setTimeout(() => {
      animateRocket();
    }, 100);
    
    setTimeout(() => {
      setPhase(2);
      createFireworks();
    }, 3000);
    
    setTimeout(() => {
      setPhase(3);
      create2026Confetti();
    }, 5000);
    
    setTimeout(() => {
      startAnimation(); // Loop
    }, 13000);
  };

  const animateRocket = () => {
    const anime = animeRef.current;
    if (!anime || !rocketRef.current) return;
    
    anime({
      targets: rocketRef.current,
      translateX: ['-300px', typeof window !== 'undefined' ? window.innerWidth + 'px' : '1500px'],
      translateY: ['0px', '-400px'],
      rotate: [-45, -45],
      duration: 3000,
      easing: 'easeOutCubic'
    });
  };

  const createFireworks = () => {
    const anime = animeRef.current;
    const canvas = canvasRef.current;
    if (!anime || !canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = typeof window !== 'undefined' ? window.innerWidth : 1920;
    canvas.height = typeof window !== 'undefined' ? window.innerHeight : 1080;
    
    const particlesArray = [];
    const numberOfParticles = 80;
    const colors = ['#FF1461', '#18FF92', '#5A87FF', '#FBF38C', '#FF6B35'];
    
    // Explosion Position (oben rechts)
    const explosionX = canvas.width * 0.85;
    const explosionY = canvas.height * 0.2;
    
    // Create particles
    for (let i = 0; i < numberOfParticles; i++) {
      const angle = (Math.PI * 2 * i) / numberOfParticles;
      const velocity = 150 + Math.random() * 100;
      
      particlesArray.push({
        x: explosionX,
        y: explosionY,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: Math.random() * 4 + 2,
        endX: explosionX + Math.cos(angle) * velocity,
        endY: explosionY + Math.sin(angle) * velocity,
        draw: function() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.shadowBlur = 15;
          ctx.shadowColor = this.color;
          ctx.fill();
        }
      });
    }
    
    // Animate with anime.js
    anime({
      targets: particlesArray,
      x: function(el) { return el.endX; },
      y: function(el) { return el.endY; },
      radius: 0,
      duration: 2000,
      easing: 'easeOutExpo',
      delay: anime.stagger(10),
      update: function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particlesArray.forEach(p => p.draw());
      }
    });
  };

  const create2026Confetti = () => {
    const anime = animeRef.current;
    const canvas = canvasRef.current;
    if (!anime || !canvas) return;
    
    const ctx = canvas.getContext('2d');
    const confettiArray = [];
    
    // Create 15 "2026" text confetti
    for (let i = 0; i < 15; i++) {
      confettiArray.push({
        x: Math.random() * canvas.width,
        y: -100 - (i * 60),
        rotation: Math.random() * 360,
        scale: 0.6 + Math.random() * 0.5,
        opacity: 1,
        velocityX: (Math.random() - 0.5) * 3,
        color: ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#00FF00'][Math.floor(Math.random() * 5)],
        draw: function() {
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate(this.rotation * Math.PI / 180);
          ctx.scale(this.scale, this.scale);
          ctx.globalAlpha = this.opacity;
          
          // Text mit Glow
          ctx.font = 'bold 70px Arial';
          ctx.fillStyle = this.color;
          ctx.shadowBlur = 20;
          ctx.shadowColor = this.color;
          ctx.strokeStyle = '#FFF';
          ctx.lineWidth = 4;
          ctx.strokeText('2026', -60, 25);
          ctx.fillText('2026', -60, 25);
          
          // Kleeblatt emoji oben
          ctx.font = '40px Arial';
          ctx.fillText('🍀', -20, -30);
          
          ctx.restore();
        }
      });
    }
    
    // Animate falling confetti
    anime({
      targets: confettiArray,
      y: canvas.height + 200,
      x: function(el) { return el.x + el.velocityX * 120; },
      rotation: '+=1080',
      opacity: [1, 0.7],
      duration: 8000,
      easing: 'easeInQuad',
      delay: anime.stagger(150),
      update: function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confettiArray.forEach(c => c.draw());
      }
    });
  };

  return (
    <>
      <style jsx>{`
        .preview-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        }
        
        .title {
          position: fixed;
          top: 30px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 32px;
          font-weight: bold;
          z-index: 10001;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
          text-align: center;
        }
        
        .phase-indicator {
          position: fixed;
          top: 90px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255,255,255,0.95);
          padding: 12px 25px;
          border-radius: 25px;
          color: #1a1a2e;
          font-weight: bold;
          font-size: 18px;
          z-index: 10001;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .rocket {
          position: fixed;
          bottom: 50%;
          left: -300px;
          width: 250px;
          height: auto;
          z-index: 10000;
          filter: drop-shadow(0 0 20px rgba(255,255,255,0.5));
        }
        
        .canvas-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 9999;
        }
        
        .info {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255,255,255,0.95);
          padding: 20px 30px;
          border-radius: 15px;
          text-align: center;
          z-index: 10001;
          max-width: 700px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        
        @media (max-width: 768px) {
          .title {
            font-size: 24px;
          }
          
          .rocket {
            width: 150px;
          }
          
          .info {
            font-size: 14px;
            padding: 15px 20px;
            max-width: 90%;
          }
        }
      `}</style>

      <div className="preview-container">
        <div className="title">
          ✨ Silvester-Animation mit anime.js ✨
        </div>
        
        <div className="phase-indicator">
          {phase === 1 && '🚀 Phase 1: Schweinchen-Rakete fliegt!'}
          {phase === 2 && '💥 Phase 2: Partikel-Feuerwerk!'}
          {phase === 3 && '🎊 Phase 3: 2026-Konfetti mit Glücksklee!'}
        </div>
        
        {phase === 1 && (
          <img 
            ref={rocketRef}
            src="/newyear-rocket.png" 
            alt="Schweinchen-Rakete"
            className="rocket"
          />
        )}
        
        <canvas 
          ref={canvasRef}
          className="canvas-container"
        />
        
        <div className="info">
          <strong>🎆 Professionelle anime.js Animation + Schweinchen 🐷</strong><br/>
          <span style={{fontSize: '14px', lineHeight: '1.8'}}>
            Phase 1: Schweinchen-Rakete mit smooth anime.js Easing (3s)<br/>
            Phase 2: 80 bunte Partikel explodieren in alle Richtungen (2s)<br/>
            Phase 3: 15x "2026 🍀" fallen als animierter Konfetti (8s)<br/>
            <em>✨ Keine PNG-Hintergründe · Flüssige Animationen · 13s Loop</em>
          </span>
        </div>
      </div>
    </>
  );
}
