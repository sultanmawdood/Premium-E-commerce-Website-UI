import { useEffect, useState } from 'react';
import { Zap, Target, Trophy, Star, Crown } from 'lucide-react';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0); // 0: intro, 1: loading, 2: complete
  const [logoVisible, setLogoVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    // Phase 1: Logo entrance (0.5s)
    setTimeout(() => {
      setLogoVisible(true);
    }, 200);

    // Phase 2: Text entrance (0.8s)
    setTimeout(() => {
      setTextVisible(true);
      setPhase(1);
    }, 500);

    // Phase 3: Progress animation (1.5s)
    const startProgress = setTimeout(() => {
      const duration = 1200; // Reduced from 2500ms to 1200ms
      const interval = 16; // 60fps
      const steps = duration / interval;
      const progressStep = 100 / steps;
      let currentStep = 0;

      const progressTimer = setInterval(() => {
        currentStep++;
        const easeOutQuart = 1 - Math.pow(1 - currentStep / steps, 3); // Faster easing
        const newProgress = Math.min(easeOutQuart * 100, 100);
        setProgress(newProgress);

        if (newProgress >= 100) {
          clearInterval(progressTimer);
          setPhase(2);
          
          // Final transition
          setTimeout(() => {
            onLoadingComplete();
          }, 300); // Reduced from 800ms
        }
      }, interval);

      return () => clearInterval(progressTimer);
    }, 600); // Reduced from 1200ms

    return () => clearTimeout(startProgress);
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0">
        {/* Radial Gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-gray-900/50 via-black to-black"></div>
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }}></div>
        </div>

        {/* Floating Orbs - Reduced count */}
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-xl opacity-20"
            style={{
              width: `${60 + Math.random() * 120}px`,
              height: `${60 + Math.random() * 120}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${[
                '#ef4444', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'
              ][Math.floor(Math.random() * 5)]}40, transparent)`,
              animation: `float ${8 + Math.random() * 8}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        {/* Logo Section */}
        <div className="mb-16">
          {/* Logo Container */}
          <div className={`relative transition-all duration-700 ease-out transform ${
            logoVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-8'
          }`}>
            {/* Outer Glow Ring */}
            <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-red-500/20 via-blue-500/20 to-purple-500/20 blur-2xl animate-pulse"></div>
            
            {/* Logo Background */}
            <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-gray-800 to-black border border-gray-700/50 shadow-2xl overflow-hidden">
              {/* Inner Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-500 to-red-700 opacity-90"></div>
              
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-60"></div>
              
              {/* Logo Letter */}
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <span className="text-white font-black text-6xl tracking-wider drop-shadow-lg">K</span>
              </div>
              
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-red-500 via-blue-500 to-purple-500 opacity-50 animate-spin-slow"></div>
            </div>
          </div>

          {/* Brand Text */}
          <div className={`text-center mt-8 transition-all duration-700 delay-200 ease-out transform ${
            textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <h1 className="text-6xl font-black text-white mb-2 tracking-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                KINGSPORTS
              </span>
            </h1>
            <div className="h-0.5 w-24 bg-gradient-to-r from-red-500 to-blue-500 mx-auto mb-4 rounded-full"></div>
            <p className="text-gray-400 text-xl font-light tracking-widest uppercase">
              Athletic Excellence
            </p>
          </div>
        </div>

        {/* Progress Section */}
        {phase >= 1 && (
          <div className={`w-full max-w-lg px-8 transition-all duration-600 ease-out transform ${
            phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {/* Progress Container */}
            <div className="relative">
              {/* Background Track */}
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden shadow-inner">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-blue-500/20 rounded-full blur-sm"></div>
                
                {/* Progress Bar */}
                <div 
                  className="relative h-full bg-gradient-to-r from-red-500 via-orange-500 to-blue-500 rounded-full transition-all duration-300 ease-out shadow-lg"
                  style={{ width: `${progress}%` }}
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full animate-shimmer"></div>
                  
                  {/* Progress Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-blue-500 rounded-full blur-sm opacity-60"></div>
                </div>
              </div>
              
              {/* Progress Text */}
              <div className="flex justify-between items-center mt-6">
                <span className="text-gray-500 text-sm font-medium tracking-wide">
                  {progress < 30 ? 'Initializing...' :
                   progress < 60 ? 'Loading Assets...' :
                   progress < 90 ? 'Optimizing...' : 'Ready!'}
                </span>
                <span className="text-white font-bold text-lg tabular-nums">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sports Icons */}
        {phase >= 1 && (
          <div className={`mt-12 transition-all duration-600 delay-100 ease-out transform ${
            phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}>
            <div className="flex justify-center space-x-8">
              {[
                { Icon: Zap, color: 'text-yellow-500', delay: '0ms' },
                { Icon: Target, color: 'text-red-500', delay: '200ms' },
                { Icon: Trophy, color: 'text-blue-500', delay: '400ms' },
                { Icon: Star, color: 'text-purple-500', delay: '600ms' },
                { Icon: Crown, color: 'text-orange-500', delay: '800ms' }
              ].map(({ Icon, color, delay }, index) => (
                <div
                  key={index}
                  className={`${color} animate-bounce opacity-70 hover:opacity-100 transition-opacity`}
                  style={{ animationDelay: delay }}
                >
                  <Icon size={24} strokeWidth={2} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Elements */}
      {phase >= 1 && (
        <div className={`absolute bottom-12 left-1/2 transform -translate-x-1/2 text-center transition-all duration-700 delay-300 ease-out ${
          phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <p className="text-gray-600 text-sm font-medium tracking-wide mb-3">
            Crafting Premium Experiences
          </p>
          
          {/* Animated Dots */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-gradient-to-r from-red-500 to-blue-500 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}