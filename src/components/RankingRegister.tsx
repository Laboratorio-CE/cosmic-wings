import React, { useState, useEffect, useCallback } from "react";
import imagemPlayer from "../assets/images/player/player-frame-1.png";
import { create } from "../services/supabaseService";

interface RankingRegisterProps {
  score: number;
  onNavigateToMenu: () => void;
}

const RankingRegister: React.FC<RankingRegisterProps> = ({ 
  score,
  onNavigateToMenu
}) => {
  // Estados para o formulário de nome
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Estado para controlar qual botão está selecionado (0 = Voltar, 1 = Enviar)
  const [selectedButton, setSelectedButton] = useState(1);
  // Estado para controlar se o input está em foco
  const [isInputFocused, setIsInputFocused] = useState(false);

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
      
      // Volta ao menu após o envio
      onNavigateToMenu();
    } catch (error) {
      console.error('Erro ao enviar score:', error);
      setIsSubmitting(false);
    }
  }, [playerName, isSubmitting, score, onNavigateToMenu]);

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

      // Previne o comportamento padrão apenas para teclas de navegação
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 's', 'S', 'a', 'A', 'd', 'D'].includes(event.key)) {
        event.preventDefault();
      }

      switch (event.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
        case 'a':
        case 'A':
        case 'ArrowLeft':
          setSelectedButton(0); // Voltar
          break;

        case 's':
        case 'S':
        case 'ArrowDown':
        case 'd':
        case 'D':
        case 'ArrowRight':
          setSelectedButton(1); // Enviar
          break;

        case 'Enter':
        case 'f':
        case 'F':
        case '5':
        case ' ':
          event.preventDefault();
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
    <div>
      <div className="w-[800px] h-[600px] bg-gradient-to-br from-black/80 to-blue-900/90 border-2 border-cyan-400 rounded-2xl text-white font-mono shadow-2xl shadow-cyan-400/20 flex flex-col items-center justify-center px-16 py-10">
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
        </div>

        {/* Formulário para inserir nome */}
        <div className="w-full max-w-md">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Digite seu nome ou apelido"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              maxLength={20}
              className="w-full px-4 py-3 bg-black/80 border-2 border-cyan-400 rounded-lg 
                        text-cyan-400 font-mono text-lg placeholder-cyan-400/60 
                        focus:outline-none focus:border-cyan-300 focus:shadow-lg focus:shadow-cyan-400/30"
            />
            {playerName.trim().length > 0 && playerName.trim().length < 2 && (
              <p className="text-red-400 font-mono text-sm mt-2">
                Mínimo de 2 caracteres
              </p>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            {/* Botão Voltar */}
            <button
              onClick={handleBackToMenu}
              onMouseEnter={() => setSelectedButton(0)}
              disabled={isSubmitting}
              className={`relative flex items-center justify-center w-40 p-3 font-bold text-base 
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
                  className="absolute left-0 w-6 h-6 rotate-90"
                />
              )}
              <span className="text-left w-full pl-8">VOLTAR</span>
            </button>

            {/* Botão Enviar */}
            <button
              onClick={handleSubmitScore}
              onMouseEnter={() => setSelectedButton(1)}
              disabled={!isValidPlayerName(playerName) || isSubmitting}
              className={`relative flex items-center justify-center w-40 p-3 font-bold text-base 
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
                  className="absolute left-0 w-6 h-6 rotate-90"
                />
              )}
              <span className="text-left w-full pl-8">
                {isSubmitting ? "ENVIANDO..." : "ENVIAR"}
              </span>
            </button>
          </div>

          {/* Instruções de navegação */}
          <div className="mt-4 text-center text-cyan-400 text-xs space-y-1">
            <p>Use W/A/S/D ou setas para navegar entre botões</p>
            <p>ENTER, ESPAÇO ou F para selecionar</p>
            <p>Digite normalmente quando o campo estiver em foco</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingRegister;
