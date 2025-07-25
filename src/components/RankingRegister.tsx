import React, { useState, useEffect, useCallback } from "react";
import imagemPlayer from "../assets/images/player/player-frame-1.png";
import { create } from "../services/supabaseService";
import AudioManager from '../services/AudioManager';

interface RankingRegisterProps {
  score: number;
  onNavigateToMenu: () => void;
  onNavigateToLeaderboards: () => void;
}

const RankingRegister: React.FC<RankingRegisterProps> = ({ 
  score,
  onNavigateToMenu,
  onNavigateToLeaderboards
}) => {
  const audioManager = AudioManager.getInstance();

  // Estados para o formulário de nome
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Estado para controlar qual botão está selecionado (0 = Voltar, 1 = Enviar)
  const [selectedButton, setSelectedButton] = useState(1);
  // Estado para controlar se o input está em foco
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Função para reproduzir som de navegação
  const playNavigateSound = () => {
    try {
      audioManager.playSoundEffect('menu-navigate');
    } catch (error) {
      console.error("Erro ao reproduzir som de navegação:", error);
    }
  };

  // Função para reproduzir som de confirmação
  const playConfirmSound = () => {
    try {
      audioManager.playSoundEffect('menu-confirm');
    } catch (error) {
      console.error("Erro ao reproduzir som de confirmação:", error);
    }
  };

  // Função para validar o nome do jogador
  const isValidPlayerName = (name: string): boolean => {
    return name.trim().length >= 2;
  };

  // Função para enviar o score
  const handleSubmitScore = useCallback(async () => {
    if (!isValidPlayerName(playerName) || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await create({
        player_name: playerName.trim(),
        player_score: score
      });
      
      // Vai para o Leaderboards após o envio
      onNavigateToLeaderboards();
    } catch (error) {
      console.error('Erro ao enviar score:', error);
      setIsSubmitting(false);
    }
  }, [playerName, isSubmitting, score, onNavigateToLeaderboards]);

  // Função para voltar ao menu
  const handleBackToMenu = useCallback(() => {
    onNavigateToMenu();
  }, [onNavigateToMenu]);

  // Efeito para controlar a navegação por teclado no formulário
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Se o input estiver em foco, não processa as teclas de navegação e ação
      if (isInputFocused) {
        return;
      }

      // Previne o comportamento padrão apenas para teclas de navegação quando o input NÃO está em foco
      // (já garantido pelo if acima)
      if ([
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'w', 'W', 's', 'S', 'a', 'A', 'd', 'D',
        'f', 'F', '5', ' ', 'Numpad5'
      ].includes(event.key)) {
        event.preventDefault();
      }

      switch (event.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
        case 'a':
        case 'A':
        case 'ArrowLeft':
          // Reproduzir som de navegação
          playNavigateSound();
          setSelectedButton(0); // Voltar
          break;

        case 's':
        case 'S':
        case 'ArrowDown':
        case 'd':
        case 'D':
        case 'ArrowRight':
          // Reproduzir som de navegação
          playNavigateSound();
          setSelectedButton(1); // Enviar
          break;

        case 'Enter':
        case 'f':
        case 'F':
        case '5':
        case ' ':
          event.preventDefault();
          // Reproduzir som de confirmação
          playConfirmSound();
          if (selectedButton === 0) {
            handleBackToMenu();
          } else if (selectedButton === 1) {
            handleSubmitScore();
          }
          break;

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedButton, isInputFocused, handleBackToMenu, handleSubmitScore]);

  // Formata a pontuação com 7 dígitos, preenchendo com zeros à esquerda
  const formatScore = (currentScore: number): string => {
    return currentScore.toString().padStart(7, '0');
  };

  return (
    <div className="flex justify-center items-center w-full max-w-[800px] h-screen max-h-[600px] p-0 sm:p-4">
      <div className="w-full h-screen sm:w-[800px] sm:h-[600px] bg-gradient-to-br from-black/80 to-blue-900/90 border-2 border-cyan-400 rounded-2xl text-white font-mono shadow-2xl shadow-cyan-400/20 flex flex-col items-center justify-center gap-18 px-4 sm:px-16 py-6 sm:py-10">
        <h2 className="text-cyan-400 font-mono text-3xl sm:text-5xl font-bold tracking-wider text-center mb-4 animate-pulse">
          FIM DE JOGO
        </h2>
        <div className="text-center">
          <p className="text-cyan-400 font-mono text-lg sm:text-xl mb-2">
            PONTUAÇÃO FINAL
          </p>
          <p className="text-white font-mono text-2xl sm:text-3xl font-bold mb-6">
            {formatScore(score)}
          </p>
        </div>

        {/* Formulário para inserir nome */}
        <div className="w-full max-w-md px-4 sm:px-0">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Digite seu nome ou apelido"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              maxLength={20}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/80 border-2 border-cyan-400 rounded-lg 
                        text-cyan-400 font-mono text-base sm:text-lg placeholder-cyan-400/60 
                        focus:outline-none focus:border-cyan-300 focus:shadow-lg focus:shadow-cyan-400/30"
            />
            {playerName.trim().length > 0 && playerName.trim().length < 2 && (
              <p className="text-red-400 font-mono text-xs sm:text-sm mt-2">
                Mínimo de 2 caracteres
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            {/* Botão Voltar */}
            <button
              onClick={() => {
                playConfirmSound();
                handleBackToMenu();
              }}
              onMouseEnter={() => {
                if (selectedButton !== 0) {
                  playNavigateSound();
                }
                setSelectedButton(0);
              }}
              disabled={isSubmitting}
              className={`relative flex items-center justify-center w-full sm:w-40 p-2 sm:p-3 font-bold text-sm sm:text-base 
                        transition-all duration-200 cursor-pointer
                        ${
                          selectedButton === 0
                            ? "text-yellow-300 scale-105"
                            : "text-yellow-700 hover:text-yellow-300"
                        }
                        active:scale-100 disabled:opacity-50`}
            >
              {selectedButton === 0 && (
                <img
                  src={imagemPlayer}
                  alt="Nave selecionada"
                  className="absolute left-14 w-5 sm:w-6 h-5 sm:h-6 sm:left-0 rotate-90"
                />
              )}
              <span className="text-center sm:text-left w-full pl-6 sm:pl-8">VOLTAR</span>
            </button>

            {/* Botão Enviar */}
            <button
              onClick={() => {
                playConfirmSound();
                handleSubmitScore();
              }}
              onMouseEnter={() => {
                if (selectedButton !== 1) {
                  playNavigateSound();
                }
                setSelectedButton(1);
              }}
              disabled={!isValidPlayerName(playerName) || isSubmitting}
              className={`relative flex items-center justify-center w-full sm:w-40 p-2 sm:p-3 font-bold text-sm sm:text-base 
                        transition-all duration-200 cursor-pointer
                        ${
                          selectedButton === 1
                            ? "text-yellow-300 scale-105"
                            : "text-yellow-700 hover:text-yellow-300"
                        }
                        active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {selectedButton === 1 && (
                <img
                  src={imagemPlayer}
                  alt="Nave selecionada"
                  className="absolute left-14 w-5 sm:w-6 h-5 sm:h-6 sm:left-0 rotate-90"
                />
              )}
              <span className="text-center sm:text-left w-full pl-6 sm:pl-8">
                {isSubmitting ? "ENVIANDO..." : "ENVIAR"}
              </span>
            </button>
          </div>

          {/* Instruções de navegação */}
          <div className="mt-4 text-center text-cyan-400 text-xs space-y-1 px-2">
            <p className="hidden sm:block">Use W/A/S/D ou setas para navegar entre botões</p>
            <p className="hidden sm:block">ENTER, ESPAÇO ou F para selecionar</p>
            <p className="hidden sm:block">Digite normalmente quando o campo estiver em foco</p>
            <p className="sm:hidden">Toque nos botões para navegar</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingRegister;
