import React, { useState, useEffect, useRef } from 'react';
import anime from 'animejs';

export default function PreviewNewYearAnime() {
  const [phase, setPhase] = useState(1);
  const canvasRef = useRef(null);
  const rocketRef = useRef(null);

  useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = () => {
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
    if (!rocketRef.current) return;
    
    anime({
      targets: rocketRef.current,
      translateX: ['-300px', window.innerWidth + 'px'],
      translateY: ['100px', '-300px'],
      rotate: [-45, -45],
      duration: 3000,
      easing: 'easeOutCubic'
    });
  };

  const createFireworks = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particlesArray = [];
    const numberOfParticles = 80;
    const colors = ['#FF1461', '#18FF92', '#5A87FF', '#FBF38C', '#FF6B35'];
    
    // Explosion Position (oben rechts)
    const explosionX = window.innerWidth * 0.85;
    const explosionY = window.innerHeight * 0.2;
    
    // Create particles
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push({
        x: explosionX,
        y: explosionY,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: Math.random() * 3 + 2,
        endX: explosionX + (Math.random() - 0.5) * 400,
        endY: explosionY + (Math.random() - 0.5) * 400,
        draw: function() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const confettiArray = [];
    
    // Create 15 "2026" text confetti
    for (let i = 0; i < 15; i++) {
      confettiArray.push({
        x: Math.random() * window.innerWidth,
        y: -100 - (i * 50),
        rotation: Math.random() * 360,
        scale: 0.8 + Math.random() * 0.4,
        opacity: 1,
        velocityX: (Math.random() - 0.5) * 2,
        draw: function() {
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate(this.rotation * Math.PI / 180);
          ctx.scale(this.scale, this.scale);
          ctx.globalAlpha = this.opacity;
          
          // Gradient text
          const gradient = ctx.createLinearGradient(-50, -30, 50, 30);
          gradient.addColorStop(0, '#FFD700');
          gradient.addColorStop(0.5, '#FFA500');
          gradient.addColorStop(1, '#FF6347');
          
          ctx.font = 'bold 60px Arial';
          ctx.fillStyle = gradient;
          ctx.strokeStyle = '#FFF';
          ctx.lineWidth = 3;
          ctx.strokeText('2026', -50, 20);
          ctx.fillText('2026', -50, 20);
          
          ctx.restore();
        }
      });
    }
    
    // Animate falling confetti
    anime({
      targets: confettiArray,
      y: window.innerHeight + 200,
      x: function(el) { return el.x + el.velocityX * 100; },
      rotation: '+=720',
      opacity: [1, 0.8],
      duration: 8000,
      easing: 'easeInQuad',
      delay: anime.stagger(200),
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .title {
          position: fixed;
          top: 30px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 32px;
          font-weight: bold;
          z-index: 10000;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        
        .phase-indicator {
          position: fixed;
          top: 90px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255,255,255,0.9);
          padding: 10px 20px;
          border-radius: 20px;
          color: #764ba2;
          font-weight: bold;
          z-index: 10000;
        }
        
        .rocket {
          position: fixed;
          bottom: 100px;
          left: -300px;
          width: 200px;
          height: auto;
          z-index: 9999;
        }
        
        .canvas-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 9998;
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
          z-index: 10000;
          max-width: 600px;
        }
      `}</style>

      <div className="preview-container">
        <div className="title">
          🎆 Silvester mit anime.js 🎆
        </div>
        
        <div className="phase-indicator">
          {phase === 1 && '🚀 Phase 1: Rakete fliegt'}
          {phase === 2 && '💥 Phase 2: Feuerwerk!'}
          {phase === 3 && '🎊 Phase 3: 2026 Konfetti!'}
        </div>
        
        {phase === 1 && (
          <img 
            ref={rocketRef}
            src="/newyear-rocket.png" 
            alt="Rakete"
            className="rocket"
          />
        )}
        
        <canvas 
          ref={canvasRef}
          className="canvas-container"
        />
        
        <div className="info">
          <strong>✨ Professionelle anime.js Animation</strong><br/>
          Phase 1: Smooth Raketen-Flug (anime.js easing)<br/>
          Phase 2: Echtes Partikel-Feuerwerk (80 Partikel)<br/>
          Phase 3: Animierter 2026-Konfetti Regen<br/>
          <em>Endlosschleife · 13 Sekunden</em>
        </div>
      </div>
    </>
  );
}
