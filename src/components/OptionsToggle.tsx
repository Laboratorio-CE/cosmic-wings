import React, { useState, useEffect } from "react";
import { FaMusic, FaPlay, FaPause } from "react-icons/fa";
import { AiFillSound } from "react-icons/ai";


type Props = {
  currentRoute?: string;
  gameState?: 'preparing' | 'playing' | 'paused' | 'gameOver';
  onTogglePause?: () => void;
}

const OptionsToggle: React.FC<Props> = ({ currentRoute, gameState, onTogglePause }) => {
  const [musicMuted, setMusicMuted] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Sincroniza o estado local com a prop gameState
  useEffect(() => {
    setIsPaused(gameState === 'paused');
  }, [gameState]);

  const toggleMusic = () => {
    setMusicMuted(prev => !prev);
  }

  const toggleSound = () => {
    setSoundMuted(prev => !prev);
  }
    
  // Verifica se está na tela do jogo
  const isGameView = currentRoute === '/play'

  // Função para renderizar o ícone correto baseado no estado
  const renderPauseIcon = () => {
    if (isPaused) {
      return <FaPlay color="black" size={16} key="play" />;
    }
    return <FaPause color="black" size={16} key="pause" />;
  };

    return (
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2 z-50">
        {/* Botão de Pausa - apenas no jogo */}
        {isGameView && (
          <button
            key={`pause-button-${isPaused ? 'paused' : 'playing'}`}
            onClick={() => {
              onTogglePause?.();
            }}
            className="relative w-6 h-6 sm:w-8 sm:h-8 bg-white border-2 border-red-500 flex items-center justify-center hover:bg-gray-100 transition-colors active:scale-95"
          >
            {renderPauseIcon()}
          </button>
        )}

        {/* Botão de Música */}
        <button
          onClick={toggleMusic}
          className="relative w-6 h-6 sm:w-8 sm:h-8 bg-white border-2 border-red-500 flex items-center justify-center hover:bg-gray-100 transition-colors active:scale-95"
        >
          {/* Ícone de Música */}
          <FaMusic color="black" />

          {/* Linha diagonal quando mutado */}
          {musicMuted && (
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="w-full h-0.5 bg-red-500 absolute top-1/2 left-0 transform -translate-y-1/2 -rotate-45 origin-center" style={{width: '141.42%', marginLeft: '-20.71%'}}></div>
              </div>
            </div>
          )}
        </button>

        {/* Botão de Som */}
        <button
          onClick={toggleSound}
          className="relative w-6 h-6 sm:w-8 sm:h-8 bg-white border-2 border-red-500 flex items-center justify-center hover:bg-gray-100 transition-colors active:scale-95"
        >
          {/* Ícone de Alto-falante */}
                <AiFillSound
                    color="black"
                />

          {/* Linha diagonal quando mutado */}
          {soundMuted && (
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="w-full h-0.5 bg-red-500 absolute top-1/2 left-0 transform -translate-y-1/2 -rotate-45 origin-center" style={{width: '141.42%', marginLeft: '-20.71%'}}></div>
              </div>
            </div>
          )}
        </button>
      </div>
    );
};

export default OptionsToggle;