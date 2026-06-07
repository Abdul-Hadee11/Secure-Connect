import React, { useMemo } from 'react';

const petals = ['🌸', '🌷', '💮', '🌺', '❤️', '💕', '💗'];

const PetalRain = ({ count = 14 }) => {
  const items = useMemo(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 10 + Math.random() * 10,
      size: 14 + Math.random() * 22,
      emoji: petals[Math.floor(Math.random() * petals.length)],
      opacity: 0.4 + Math.random() * 0.5,
    })), [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {items.map(p => (
        <span
          key={p.id}
          className="petal animate-fall"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
};

export default PetalRain;
