import React, { useEffect, useMemo } from 'react';

// Lightweight, dependency-free overlay animations around the logo placeholder
// Supported types: 'glow', 'sparkles', 'lights', 'confetti'

function GlowOverlay({ color = '#FFD54F' }) {
  const glowColor = color;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          inset: -6,
          borderRadius: 16,
          boxShadow: `0 0 0px 0px ${glowColor}`,
          animation: 'logoGlowPulse 2s ease-in-out infinite',
          filter: 'blur(2px)'
        }}
      />
      <style>
        {`@keyframes logoGlowPulse { 0% { box-shadow: 0 0 0px 0 ${glowColor}; } 50% { box-shadow: 0 0 18px 6px ${glowColor}; } 100% { box-shadow: 0 0 0px 0 ${glowColor}; } }`}
      </style>
    </div>
  );
}

function SparklesOverlay({ count = 10, color = '#ffffff' }) {
  const items = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 1.5,
    scale: 0.6 + Math.random() * 0.9,
  })), [count]);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {items.map(({ id, left, top, delay, scale }) => (
        <div
          key={id}
          style={{
            position: 'absolute',
            left: `${left}%`,
            top: `${top}%`,
            width: 6 * scale,
            height: 6 * scale,
            transform: 'translate(-50%, -50%) rotate(45deg)',
            animation: `sparkleTwinkle 1.4s ease-in-out ${delay}s infinite`,
          }}
        >
          <div style={{ width: '100%', height: 1.5 * scale, backgroundColor: color, borderRadius: 2 }} />
          <div style={{ width: 1.5 * scale, height: '100%', backgroundColor: color, borderRadius: 2, position: 'absolute', inset: 0, margin: 'auto' }} />
        </div>
      ))}
      <style>
        {`@keyframes sparkleTwinkle { 0% { opacity: 0.1; transform: translate(-50%, -50%) rotate(45deg) scale(0.8); } 50% { opacity: 1; transform: translate(-50%, -50%) rotate(45deg) scale(1.2); } 100% { opacity: 0.1; transform: translate(-50%, -50%) rotate(45deg) scale(0.8); } }`}
      </style>
    </div>
  );
}

function LightsOverlay() {
  // Simple SVG wire with flickering bulbs around the bounding rect
  const bulbColors = ['#ff4d4f', '#facc15', '#22c55e', '#3b82f6'];
  const bulbs = Array.from({ length: 16 }, (_, i) => ({ idx: i, color: bulbColors[i % bulbColors.length] }));
  return (
    <svg viewBox="0 0 120 88" width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <defs>
        <filter id="bulbGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Wire path around the inset rectangle */}
      <path d="M6,14 C30,6 48,10 62,14 S94,20 114,12 L114,76 C94,68 76,74 62,76 S30,80 6,72 Z" fill="none" stroke="#2f2f2f" strokeWidth="1.5" strokeLinecap="round" />
      {bulbs.map(({ idx, color }) => {
        const t = idx / bulbs.length;
        // Position bulbs along an approximate rounded rectangle path
        let x = 0, y = 0;
        if (t < 0.25) { // top edge
          const lt = t / 0.25;
          x = 10 + lt * 100; y = 10 + Math.sin(lt * Math.PI * 2) * 2;
        } else if (t < 0.5) { // right edge
          const lt = (t - 0.25) / 0.25;
          x = 110 + Math.sin(lt * Math.PI) * 2; y = 12 + lt * 64;
        } else if (t < 0.75) { // bottom
          const lt = (t - 0.5) / 0.25;
          x = 110 - lt * 100; y = 78 + Math.sin(lt * Math.PI * 2) * 2;
        } else { // left
          const lt = (t - 0.75) / 0.25;
          x = 10 + Math.sin(lt * Math.PI) * 2; y = 76 - lt * 64;
        }
        return (
          <g key={idx} filter="url(#bulbGlow)" opacity="0.9">
            <circle cx={x} cy={y} r="2.2" fill={color} style={{ animation: `bulbFlicker ${1 + (idx % 5) * 0.2}s ease-in-out ${(idx % 7) * 0.1}s infinite` }} />
          </g>
        );
      })}
      <style>
        {`@keyframes bulbFlicker { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }`}
      </style>
    </svg>
  );
}

function ConfettiOverlay() {
  // Very lightweight DOM confetti fall for a few seconds
  useEffect(() => {
    const container = document.getElementById('logo-confetti');
    if (!container) return;
    const pieces = 40;
    const els = [];
    for (let i = 0; i < pieces; i++) {
      const el = document.createElement('div');
      const size = 4 + Math.random() * 4;
      el.style.position = 'absolute';
      el.style.left = `${Math.random() * 100}%`;
      el.style.top = `-10%`;
      el.style.width = `${size}px`;
      el.style.height = `${size * 0.6}px`;
      el.style.background = `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`;
      el.style.transform = `rotate(${Math.random() * 360}deg)`;
      el.style.opacity = '0.9';
      el.style.borderRadius = '1px';
      el.style.animation = `confettiFall ${1.8 + Math.random() * 1.2}s linear ${Math.random() * 0.6}s forwards`;
      container.appendChild(el);
      els.push(el);
    }
    const timer = setTimeout(() => { els.forEach(e => e.remove()); }, 3200);
    return () => { clearTimeout(timer); els.forEach(e => e.remove()); };
  }, []);

  return (
    <div id="logo-confetti" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <style>
        {`@keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(120%) rotate(540deg); opacity: 0; } }`}
      </style>
    </div>
  );
}

export default function LogoAnimationOverlay({ type = null, themeColor = '#1E1E1E' }) {
  if (!type) return null;
  if (type === 'glow') return <GlowOverlay color={themeColor} />;
  if (type === 'lights') return <LightsOverlay />;
  if (type === 'confetti') return <ConfettiOverlay />;
  return <SparklesOverlay count={12} color={'#fff'} />;
}


