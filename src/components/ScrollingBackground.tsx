import React, { useEffect, useState, useRef } from 'react';
import CanvasBackground from './Background';

interface BackgroundScrollProps {
  speed: number;
}

// Componente Background com scroll para o GameCanvas
const ScrollingBackground: React.FC<BackgroundScrollProps> = ({ speed }) => {
  const [offset, setOffset] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const targetSpeedRef = useRef(speed);
  const animationRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(performance.now());
  
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
  
  // Atualizar a velocidade alvo quando o prop muda
  useEffect(() => {
    targetSpeedRef.current = speed;
  }, [speed]);
  
  // Loop de animação com interpolação suave de velocidade
  useEffect(() => {
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000; // em segundos
      lastTimeRef.current = currentTime;
      
      // Interpolar suavemente para a velocidade alvo
      const speedDifference = targetSpeedRef.current - currentSpeed;
      const lerpFactor = Math.min(deltaTime * 5, 1); // Velocidade de interpolação (5x por segundo)
      
      if (Math.abs(speedDifference) > 0.01) {
        const newSpeed = currentSpeed + speedDifference * lerpFactor;
        setCurrentSpeed(newSpeed);
      } else {
        setCurrentSpeed(targetSpeedRef.current);
      }
      
      // Atualizar offset baseado na velocidade atual
      setOffset(prev => prev + currentSpeed * deltaTime * 60); // Normalizar para ~60fps
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentSpeed]);
  
  // Calcular posições das três instâncias para scroll infinito suave
  const { height } = dimensions;
  
  // Usar módulo simples mas garantir que as instâncias se sobreponham corretamente
  const baseOffset = offset % height;
  
  // Posicionar as três instâncias de forma escalonada para cobrir toda a área visível
  // A instância que "sai" por cima é reposicionada embaixo, criando loop infinito
  const positions = [
    baseOffset - height,           // Instância que está saindo por cima
    baseOffset,                    // Instância principal visível
    baseOffset + height            // Instância que está entrando por baixo
  ];
  
  return (
    <div className="absolute inset-0 overflow-hidden bg-(--cosmic-darkest)/80">
      {/* Três instâncias idênticas do background para scroll infinito suave */}
      {positions.map((yPos, index) => (
        <div 
          key={index}
          className="absolute w-full"
          style={{ 
            height: `${height}px`,
            transform: `translateY(${yPos}px)`,
            transition: 'none'
          }}
        >
          <CanvasBackground starCount={100} seed={12345} />
        </div>
      ))}
    </div>
  );
};

export default ScrollingBackground;