'use client';
import { useState, useEffect } from 'react';

// A client component to handle the hydration mismatch for random values
const AnimatedParticles = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generateParticles = () => {
      return [...Array(15)].map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animation: `float${Math.floor(Math.random() * 3) + 1} ${8 + Math.random() * 10}s infinite ease-in-out`,
        animationDelay: `${Math.random() * 5}s`,
      }));
    };
    setParticles(generateParticles());
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-60"
          style={{
            top: p.top,
            left: p.left,
            animation: p.animation,
            animationDelay: p.animationDelay,
          }}
        ></div>
      ))}
    </div>
  );
};

export default function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 font-sans overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500 rounded-full filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      </div>
      <AnimatedParticles />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {children}
      </div>
    </main>
  );
}