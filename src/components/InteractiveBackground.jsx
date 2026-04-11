import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function InteractiveBackground({ theme = 'easy' }) {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Smooth spring physics for fluid movement
  const springConfig = { damping: 40, stiffness: 100, mass: 1 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
    };
  }, [cursorX, cursorY]);

  const getThemeColors = () => {
    switch (theme?.toLowerCase()) {
      case 'easy': return 'bg-emerald-500/30';
      case 'medium': return 'bg-amber-500/30';
      case 'hard': return 'bg-rose-500/30';
      default: return 'bg-indigo-500/30';
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen w-full pointer-events-none overflow-hidden z-0 bg-[#030303]">
      
      {/* Background static blobs for base depth */}
      <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[150px] animate-pulse-glow z-0"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full mix-blend-screen filter blur-[150px] z-0"></div>

      {/* The Mouse Tracking Dynamic Orb */}
      <motion.div
        className={`absolute top-0 left-0 w-[500px] h-[500px] rounded-full mix-blend-screen filter blur-[120px] ${getThemeColors()} transition-colors duration-1000 z-10`}
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />

      {/* The Heavy Glass Blur Layer - Mutes the intense colors into a premium gradient */}
      <div className="absolute inset-0 z-20 backdrop-blur-[60px] h-full w-full bg-black/20"></div>

      {/* Dot Grid Texture applied over the blurred gradient */}
      <div 
        className="absolute inset-0 z-30 opacity-20" 
        style={{ 
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }}>
      </div>
    </div>
  );
}
