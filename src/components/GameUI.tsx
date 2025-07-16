// Ícones removidos - usando analógico virtual
import { FaCircle } from "react-icons/fa";
import React, { useState, useEffect, useRef } from "react";
import imagemPlayer from "../assets/images/player/player-frame-1.png";

interface GameUIProps {
  lives: number;
  score: number;
  hiScore: number;
  wave: number;
  gameState: 'preparing' | 'playing' | 'paused' | 'gameOver';
  showWaveMessage?: boolean;
  waveMessageText?: string;
  onMobileControl?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onMobileControlStop?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onMobileAction?: () => void;
  onMobileActionStop?: () => void;
  onNavigateToMenu?: () => void;
  onNavigateToRankingRegister?: () => void;
}

const GameUI: React.FC<GameUIProps> = ({ 
  lives,
  score,
  hiScore,
  wave,
  gameState,
  showWaveMessage = false,
  waveMessageText = '',
  onMobileControl,
  onMobileControlStop,
  onMobileAction,
  onMobileActionStop,
  onNavigateToRankingRegister
}) => {
  // Estado para controlar a exibição das mensagens
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  // Estado para controlar a exibição do game over com delay
  const [showGameOver, setShowGameOver] = useState(false);
  
  // Estados para o analógico virtual
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [activeDirections, setActiveDirections] = useState({ up: false, down: false, left: false, right: false });
  const activeDirectionsRef = useRef(activeDirections);
  
  // Atualizar ref sempre que activeDirections mudar
  useEffect(() => {
    activeDirectionsRef.current = activeDirections;
  }, [activeDirections]);

  const handleActionStart = (event?: React.TouchEvent | React.MouseEvent) => {
    event?.preventDefault();
    onMobileAction?.();
  };

  const handleActionStop = () => {
    onMobileActionStop?.();
  };

  // Funções para o analógico virtual
  const handleAnalogStart = () => {
    setIsDragging(true);
  };

  const handleAnalogMove = (event: React.PointerEvent) => {
    if (!isDragging) return;
    
    const currentTarget = event.currentTarget as HTMLElement;
    const rect = currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const clientX = event.clientX;
    const clientY = event.clientY;
    
    const x = clientX - rect.left - centerX;
    const y = clientY - rect.top - centerY;
    
    // Limitar movimento dentro do círculo (raio 32px)
    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = 32;
    
    let finalX = x;
    let finalY = y;
    
    if (distance > maxDistance) {
      finalX = (x / distance) * maxDistance;
      finalY = (y / distance) * maxDistance;
    }
    
    setKnobPosition({ x: finalX, y: finalY });
    
    // Converter para direções (threshold de 15px)
    const threshold = 15;
    const newDirections = {
      up: finalY < -threshold,
      down: finalY > threshold,
      left: finalX < -threshold,
      right: finalX > threshold
    };
    
    // Atualizar apenas se mudou usando a ref atual
    const currentDirections = activeDirectionsRef.current;
    if (JSON.stringify(newDirections) !== JSON.stringify(currentDirections)) {
      // Parar direções que não estão mais ativas
      Object.keys(currentDirections).forEach(dir => {
        if (currentDirections[dir as keyof typeof currentDirections] && !newDirections[dir as keyof typeof newDirections]) {
          onMobileControlStop?.(dir as 'up' | 'down' | 'left' | 'right');
        }
      });
      
      // Iniciar novas direções
      Object.keys(newDirections).forEach(dir => {
        if (!currentDirections[dir as keyof typeof currentDirections] && newDirections[dir as keyof typeof newDirections]) {
          onMobileControl?.(dir as 'up' | 'down' | 'left' | 'right');
        }
      });
      
      setActiveDirections(newDirections);
    }
  };

  const handleAnalogEnd = () => {
    // Parar todas as direções ativas usando a ref atual
    Object.keys(activeDirectionsRef.current).forEach(dir => {
      if (activeDirectionsRef.current[dir as keyof typeof activeDirectionsRef.current]) {
        onMobileControlStop?.(dir as 'up' | 'down' | 'left' | 'right');
      }
    });
    
    setIsDragging(false);
    setKnobPosition({ x: 0, y: 0 });
    setActiveDirections({ up: false, down: false, left: false, right: false });
  };

  // Efeito para controlar as mensagens de preparação e onda
  useEffect(() => {
    // Se há uma mensagem de onda externa, usá-la
    if (showWaveMessage && waveMessageText) {
      setMessageText(waveMessageText);
      setShowMessage(true);
      return;
    }

    if (gameState === 'preparing') {
      // Primeiro mostra "PREPARAR" por 2 segundos
      setMessageText('PREPARAR');
      setShowMessage(true);
      
      const prepareTimer = setTimeout(() => {
        // Depois mostra "ONDA #" com o número da onda
        setMessageText(`ONDA ${wave}`);
        
        // Remove a mensagem após mais 2 segundos
        const waveTimer = setTimeout(() => {
          setShowMessage(false);
        }, 2000);
        
        return () => clearTimeout(waveTimer);
      }, 2000);
      
      return () => clearTimeout(prepareTimer);
    } else if (gameState === 'paused') {
      // Mostra "PAUSA" quando o jogo estiver pausado
      setMessageText('PAUSA');
      setShowMessage(true);
    } else {
      setShowMessage(false);
    }
  }, [gameState, wave, showWaveMessage, waveMessageText]);

  // Efeito para controlar o delay da exibição do game over
  useEffect(() => {
    if (gameState === 'gameOver') {
      // Exibe o game over após 2 segundos
      const gameOverTimer = setTimeout(() => {
        setShowGameOver(true);
        // Navega para o RankingRegister após mais 3 segundos
        const registerTimer = setTimeout(() => {
          onNavigateToRankingRegister?.();
        }, 3000);
        
        return () => clearTimeout(registerTimer);
      }, 2000);
      
      return () => clearTimeout(gameOverTimer);
    } else {
      setShowGameOver(false);
    }
  }, [gameState, onNavigateToRankingRegister]);

  // Detecta se é um dispositivo móvel/touch
  const isMobileDevice = () => {
    return window.innerWidth <= 768 || 'ontouchstart' in window;
  };
  // Formata a pontuação com 7 dígitos, preenchendo com zeros à esquerda
  const formatScore = (currentScore: number): string => {
    const displayScore = currentScore % 10000000;
    return displayScore.toString().padStart(7, '0');
  };

  // Renderiza as vidas como uma imagem + "x" + número
  const renderLives = () => {
    return (
      <div className="flex items-center">
        <img src={imagemPlayer} alt="Imagem das vidas do jogador" className="w-5 h-5 mr-1"/>
        <span className="text-cyan-400 font-mono text-lg font-bold">x{lives}</span>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Vidas - Canto superior esquerdo */}
      <div className="absolute top-4 left-4 flex items-center pointer-events-auto">
        <div className="flex">{renderLives()}</div>
      </div>
      {/* Pontuação */}
      {isMobileDevice() ? (
        // Em dispositivos móveis, centraliza no topo
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center pointer-events-auto">
          <span className="text-cyan-400 font-mono text-lg font-bold tracking-wider">
        {formatScore(score)}
          </span>
        </div>
      ) : (
        // Em desktop, canto superior direito
        <div className="absolute top-4 right-4 flex items-center pointer-events-auto">
          <span className="text-cyan-400 font-mono text-lg font-bold tracking-wider">
        {formatScore(score)}
          </span>
        </div>
      )}

      {/* Mensagem Central - "PREPARAR" e "ONDA #" */}
      {showMessage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/80 border-4 border-cyan-400 rounded-2xl px-12 py-8 shadow-2xl shadow-cyan-400/50">
            <h2 className="text-cyan-400 font-mono text-4xl font-bold tracking-wider text-center animate-pulse">
              {messageText}
            </h2>
          </div>
        </div>
      )}

      {/* Mensagem de Fim de Jogo */}
      {showGameOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/90 border-4 border-cyan-400 rounded-2xl px-16 py-10 shadow-2xl shadow-cyan-500/50">
            <h2 className="text-cyan-400 font-mono text-5xl font-bold tracking-wider text-center mb-4 animate-pulse">
              FIM DE JOGO
            </h2>
            <div className="text-center">
              <p className="text-cyan-400 font-mono text-xl mb-2">
                PONTUAÇÃO FINAL
              </p>
              <p className="text-white font-mono text-3xl font-bold mb-6">
                {hiScore}
              </p>
              <p className="text-cyan-400 font-mono text-sm animate-pulse">
                Aguarde...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controles Mobile - Apenas em dispositivos pequenos */}
      {isMobileDevice() && (
        <>
          {/* Analógico Virtual - Canto inferior esquerdo */}
          <div className="absolute bottom-4 left-4 pointer-events-auto">
            <div 
              className="relative w-20 h-20 bg-cyan-400/10 border-2 border-cyan-400/30 rounded-full flex items-center justify-center"
              data-analog="true"
              onPointerDown={handleAnalogStart}
              onPointerMove={handleAnalogMove}
              onPointerUp={handleAnalogEnd}
              onPointerLeave={handleAnalogEnd}
              style={{ touchAction: 'none' }}
            >
              {/* Knob do analógico */}
              <div 
                className="absolute w-8 h-8 bg-cyan-400/60 border-2 border-cyan-400 rounded-full transition-all duration-75"
                style={{
                  transform: `translate(${knobPosition.x}px, ${knobPosition.y}px)`,
                  backgroundColor: isDragging ? 'rgba(34, 211, 238, 0.8)' : 'rgba(34, 211, 238, 0.6)'
                }}
              />
            </div>
          </div>

          {/* Botão de Ação - Canto inferior direito */}
          <div className="absolute bottom-4 right-4 pointer-events-auto">
            <button
              onTouchStart={handleActionStart}
              onTouchEnd={handleActionStop}
              onMouseDown={handleActionStart}
              onMouseUp={handleActionStop}
              onMouseLeave={handleActionStop}
              className="bg-red-500/20 hover:bg-red-500/40 border-2 border-red-500 
                        rounded-full w-12 h-12 flex items-center justify-center
                        transition-all duration-150 active:scale-95"
              style={{ touchAction: 'manipulation' }}
            >
              <FaCircle className="text-red-500 text-lg" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default GameUI;
