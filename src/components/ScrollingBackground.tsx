import React, { useEffect, useState } from 'react';
import CanvasBackground from './Background';

interface BackgroundScrollProps {
  speed: number;
}

// Componente Background com scroll para o GameCanvas
const ScrollingBackground: React.FC<BackgroundScrollProps> = ({ speed }) => {
  const [offset, setOffset] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Detectar mudanças de tamanho do container
  useEffect(() => {
    const updateDimensions = () => {
      if (window.innerWidth < 640) {
        // Mobile: usar toda a viewport
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      } else {
        // Desktop: usar dimensões fixas
        setDimensions({
          width: 800,
          height: 600
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => prev + speed);
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [speed]);
  
  // Calcular posições das três instâncias para scroll infinito suave
  const { height } = dimensions;
  const firstY = offset % height;
  const secondY = firstY - height;
  const thirdY = firstY + height;
  
  return (
    <div className="absolute inset-0 overflow-hidden bg-(--cosmic-darkest)/80">
      {/* Três instâncias do background para scroll infinito suave */}
      <div 
        className="absolute w-full"
        style={{ 
          height: `${height}px`,
          transform: `translateY(${firstY}px)`,
          transition: 'none'
        }}
      >
        <CanvasBackground starCount={100} />
      </div>
      <div 
        className="absolute w-full"
        style={{ 
          height: `${height}px`,
          transform: `translateY(${secondY}px)`,
          transition: 'none'
        }}
      >
        <CanvasBackground starCount={100} />
      </div>
      <div 
        className="absolute w-full"
        style={{ 
          height: `${height}px`,
          transform: `translateY(${thirdY}px)`,
          transition: 'none'
        }}
      >
        <CanvasBackground starCount={100} />
      </div>
    </div>
  );
};

export default ScrollingBackground;