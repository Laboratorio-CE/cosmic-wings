import {
  IoChevronBackCircleOutline,
  IoChevronUpCircleOutline,
  IoChevronForwardCircleOutline,
  IoChevronDownCircleOutline,
} from "react-icons/io5";
import { FaCircle } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import imagemPlayer from "../assets/images/player/player-frame-1.png";

interface GameUIProps {
  lives: number;
  score: number;
  wave: number;
  gameState: 'preparing' | 'playing' | 'paused' | 'gameOver';
  showWaveMessage?: boolean;
  waveMessageText?: string;
  onMobileControl?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onMobileAction?: () => void;
  onNavigateToMenu?: () => void;
  onNavigateToRankingRegister?: () => void;
}

const GameUI: React.FC<GameUIProps> = ({ 
  lives,
  score,
  wave,
  gameState,
  showWaveMessage = false,
  waveMessageText = '',
  onMobileControl,
  onMobileAction,
  onNavigateToRankingRegister
}) => {
  // Estado para controlar a exibição das mensagens
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  // Estado para controlar a exibição do game over com delay
  const [showGameOver, setShowGameOver] = useState(false);

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
    return currentScore.toString().padStart(7, '0');
  };

  // Renderiza as vidas como ícones de nave
  const renderLives = () => {
    const lifeIcons = [];
    for (let i = 0; i < lives; i++) {
      lifeIcons.push(
        <div
          key={i}
          >
          <img src={imagemPlayer} alt="Imagem das vidas do jogador" className="w-5 h-5"/>
          </div>
          
      );
    }
    return lifeIcons;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Vidas - Canto superior esquerdo */}
      <div className="absolute top-4 left-4 flex items-center pointer-events-auto">
        <div className="flex">{renderLives()}</div>
      </div>

      {/* Pontuação - Canto superior direito */}
      <div className="absolute top-4 right-4 flex items-center pointer-events-auto">
        <span className="text-cyan-400 font-mono text-lg font-bold tracking-wider">
          {formatScore(score)}
        </span>
      </div>

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
                {formatScore(score)}
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
          {/* D-Pad - Canto inferior esquerdo */}
          <div className="absolute bottom-8 left-8 pointer-events-auto">
            <div className="relative w-32 h-32">
              {/* Botão Cima */}
              <button
                onTouchStart={() => onMobileControl?.("up")}
                className="absolute top-0 left-1/2 transform -translate-x-1/2 
                          bg-cyan-400/20 hover:bg-cyan-400/40 border-2 border-cyan-400 
                          rounded-full w-12 h-12 flex items-center justify-center
                          transition-all duration-150 active:scale-95"
              >
                <IoChevronUpCircleOutline className="text-cyan-400 text-2xl" />
              </button>

              {/* Botão Esquerda */}
              <button
                onTouchStart={() => onMobileControl?.("left")}
                className="absolute top-1/2 left-0 transform -translate-y-1/2
                          bg-cyan-400/20 hover:bg-cyan-400/40 border-2 border-cyan-400 
                          rounded-full w-12 h-12 flex items-center justify-center
                          transition-all duration-150 active:scale-95"
              >
                <IoChevronBackCircleOutline className="text-cyan-400 text-2xl" />
              </button>

              {/* Botão Direita */}
              <button
                onTouchStart={() => onMobileControl?.("right")}
                className="absolute top-1/2 right-0 transform -translate-y-1/2
                          bg-cyan-400/20 hover:bg-cyan-400/40 border-2 border-cyan-400 
                          rounded-full w-12 h-12 flex items-center justify-center
                          transition-all duration-150 active:scale-95"
              >
                <IoChevronForwardCircleOutline className="text-cyan-400 text-2xl" />
              </button>

              {/* Botão Baixo */}
              <button
                onTouchStart={() => onMobileControl?.("down")}
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2
                          bg-cyan-400/20 hover:bg-cyan-400/40 border-2 border-cyan-400 
                          rounded-full w-12 h-12 flex items-center justify-center
                          transition-all duration-150 active:scale-95"
              >
                <IoChevronDownCircleOutline className="text-cyan-400 text-2xl" />
              </button>
            </div>
          </div>

          {/* Botão de Ação - Canto inferior direito */}
          <div className="absolute bottom-8 right-8 pointer-events-auto">
            <button
              onTouchStart={() => onMobileAction?.()}
              className="bg-red-500/20 hover:bg-red-500/40 border-2 border-red-500 
                        rounded-full w-16 h-16 flex items-center justify-center
                        transition-all duration-150 active:scale-95"
            >
              <FaCircle className="text-red-500 text-2xl" />
            </button>
            <span className="block text-center text-cyan-400 text-xs mt-2 font-mono">
              ATIRAR
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default GameUI;
