'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from './components/Header';
import ProposalForm from './components/ProposalForm';
import { Loader2 } from 'lucide-react';

// This component handles the random values for animations only on the client-side
// to prevent hydration errors.
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

// This is the main content of your page
function ProposalPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const resubmitId = searchParams.get('resubmit');

  useEffect(() => {
    // Simulate a brief loading time for the entrance animation
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 font-sans overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500 rounded-full filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <AnimatedParticles />

      {/* Loading Screen Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cyan-400 font-medium">Loading Portal</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-center text-white mb-2 animate-fade-in-down">
                {resubmitId ? 'Resubmit Your Proposal' : 'New Event Proposal'}
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto my-4 rounded-full"></div>
              <p className="text-center text-gray-300 mb-8 text-xl animate-fade-in-up">
                {resubmitId ? 'Please make the required changes and submit again.' : 'Fill out the form for Tech Invent 2025.'}
              </p>
            </div>
            
            <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
              <ProposalForm resubmitId={resubmitId} />
            </div>
          </div>
        </div>
        <footer className="text-center py-6 text-gray-400 text-sm mt-12">
          © 2025 Chandigarh University | Office of Academic Affairs
        </footer>
      </div>
    </main>
  );
}

// The final export wraps the page content in Suspense
// This is the standard Next.js pattern for using searchParams
export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
      </div>
    }>
      <ProposalPageContent />
    </Suspense>
  );
}