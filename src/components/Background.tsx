import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import React from "react";

interface BackgroundProps {
  starCount?: number;
  seed?: number; // Seed para gerar estrelas consistentes
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

// Função para gerar números pseudo-aleatórios com seed
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

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

const Background = ({ starCount = 150, seed = 12345 }: BackgroundProps) => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  // Usar ref para manter dimensões estáveis e evitar re-gerações desnecessárias
  const stableDimensionsRef = useRef(dimensions);
  
  // Debounced resize handler
  const handleResize = useCallback(() => {
    const timeoutId = setTimeout(() => {
      const newDimensions = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      setDimensions(newDimensions);
      stableDimensionsRef.current = newDimensions;
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  // Gerar estrelas otimizadas com memo e seed para consistência
  const stars = useMemo(() => {
    const starArray: StarData[] = [];
    
    // Limitar animações para melhor performance
    const maxAnimatedStars = Math.min(starCount * 0.3, 100);
    
    // Usar dimensões estáveis para evitar re-gerações durante animações
    const { width, height } = stableDimensionsRef.current;
    
    for (let i = 0; i < starCount; i++) {
      // Usar seed + index para gerar valores consistentes
      const baseSeed = seed + i;
      
      const star: StarData = {
        id: i,
        x: seededRandom(baseSeed) * width,
        y: seededRandom(baseSeed + 1000) * height,
        size: seededRandom(baseSeed + 2000) * 2 + 1,
        opacity: seededRandom(baseSeed + 3000) * 0.7 + 0.3,
        duration: seededRandom(baseSeed + 4000) * 4 + 2,
        delay: seededRandom(baseSeed + 5000) * 5,
        shouldTwinkle: i < maxAnimatedStars, // Apenas algumas estrelas piscam
      };
      
      starArray.push(star);
    }
    
    return starArray;
  }, [starCount, seed]); // Removido dimensions da dependência para estabilidade

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map((star) => (
        <Star key={star.id} star={star} />
      ))}
    </div>
  );
};

export default Background;
