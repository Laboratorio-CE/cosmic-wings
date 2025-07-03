import { useEffect, useState, useMemo, useCallback } from "react";
import React from "react";

interface BackgroundProps {
  starCount?: number;
}

interface StarData {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  shouldTwinkle: boolean;
}

// Componente Star otimizado e memorizado
const Star = React.memo(({ star }: { star: StarData }) => {
  const style = useMemo(() => ({
    transform: `translate(${star.x}px, ${star.y}px)`,
    width: `${star.size}px`,
    height: `${star.size}px`,
    opacity: star.opacity,
    animationDuration: star.shouldTwinkle ? `${star.duration}s` : undefined,
    animationDelay: star.shouldTwinkle ? `${star.delay}s` : undefined,
  }), [star]);

  return (
    <div
      className={`absolute bg-white rounded-full ${star.shouldTwinkle ? 'animate-pulse' : ''}`}
      style={style}
    />
  );
});

Star.displayName = 'Star';

const Background = ({ starCount = 150 }: BackgroundProps) => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  // Debounced resize handler
  const handleResize = useCallback(() => {
    const timeoutId = setTimeout(() => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  // Gerar estrelas otimizadas com memo
  const stars = useMemo(() => {
    const starArray: StarData[] = [];
    
    // Limitar animações para melhor performance
    const maxAnimatedStars = Math.min(starCount * 0.3, 100);
    
    for (let i = 0; i < starCount; i++) {
      const star: StarData = {
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.7 + 0.3,
        duration: Math.random() * 4 + 2,
        delay: Math.random() * 5,
        shouldTwinkle: i < maxAnimatedStars, // Apenas algumas estrelas piscam
      };
      
      starArray.push(star);
    }
    
    return starArray;
  }, [starCount, dimensions.width, dimensions.height]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map((star) => (
        <Star key={star.id} star={star} />
      ))}
    </div>
  );
};

export default Background;
