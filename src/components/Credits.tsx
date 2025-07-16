import React, { useState, useEffect } from "react";
import imagemPlayer from "../assets/images/player/player-frame-1.png";
import banner from "../assets/images/credits/Banner.jpg";
import avatar from "../assets/images/credits/avatar.png";
import AudioManager from '../services/AudioManager';

interface CreditsProps {
  onNavigateToMenu: () => void;
}

const Credits: React.FC<CreditsProps> = ({ onNavigateToMenu }) => {
  const [selectedButton, setSelectedButton] = useState(0);
  const audioManager = AudioManager.getInstance();

  // Função para reproduzir som de confirmação
  const playConfirmSound = () => {
    try {
      audioManager.playSoundEffect('menu-confirm');
    } catch (error) {
      console.error("Erro ao reproduzir som de confirmação:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
        case 'f':
        case 'F':
        case '5':
        case ' ':
        case 'Escape':
          event.preventDefault();
          // Reproduzir som de confirmação
          playConfirmSound();
          onNavigateToMenu();
          break;

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNavigateToMenu]);

  return (
    <div className="flex justify-center items-center h-screen min-h-screen p-0 sm:p-4">
      <div className="w-full h-full sm:w-[800px] sm:h-[600px] bg-gradient-to-br from-black/80 to-blue-900/90 border-2 border-cyan-400 rounded-2xl text-white font-mono shadow-2xl shadow-cyan-400/20 flex flex-col items-center justify-start px-4 sm:px-8 py-6 overflow-y-auto scrollbar-hide">
        {/* Título */}
        <h2 className="text-cyan-400 font-mono text-2xl sm:text-4xl font-bold tracking-wider text-center mt-12 sm:mt-6 mb-4 sm:mb-6 pt-4 sm:pt-0">
          CRÉDITOS
        </h2>

        {/* Desenvolvido por */}
        <div className="text-center mb-4 sm:mb-6 flex flex-col gap-4 sm:gap-4">
          <p className="text-cyan-400 font-mono text-lg sm:text-xl mb-2 sm:mb-2">
            Desenvolvido por:
          </p>

          {/* Container do banner com avatar */}
          <div className="flex flex-col items-center">
            <img
              src={avatar}
              alt="Avatar desenvolvedor"
              className="ml-16 transform -translate-x-1/2 w-12 sm:w-16 h-12 sm:h-16"
            />
            <img
              src={banner}
              alt="Banner dos desenvolvedores"
              className="w-64 sm:w-80 h-auto rounded-lg border-2 border-cyan-400/50"
            />
          </div>
        </div>

        {/* Links do desenvolvedor */}
        <div className="text-center mb-4 sm:mb-6 space-y-2 px-2">
          <div className="text-cyan-300 text-xs sm:text-sm">
            <p className="mb-1">GitHub Pessoal:</p>
            <a
              href="https://github.com/ven-del"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-300 font-mono text-xs bg-black/40 px-3 py-1 rounded border border-cyan-400/30 break-words hover:text-yellow-200 hover:border-cyan-300 transition-colors duration-200 cursor-pointer"
            >
              https://github.com/ven-del
            </a>
          </div>

          <div className="text-cyan-300 text-xs sm:text-sm">
            <p className="mb-1">GitHub Laboratório CE:</p>
            <a
              href="https://github.com/Laboratorio-CE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-300 font-mono text-xs bg-black/40 px-3 py-1 rounded border border-cyan-400/30 break-words hover:text-yellow-200 hover:border-cyan-300 transition-colors duration-200 cursor-pointer"
            >
              https://github.com/Laboratorio-CE
            </a>
          </div>

          <div className="text-cyan-300 text-xs sm:text-sm">
            <p className="mb-1">Repositório Cosmic Wings:</p>
            <a
              href="https://github.com/Laboratorio-CE/cosmic-wings"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-yellow-300 font-mono text-xs bg-black/40 px-3 py-1 rounded border border-cyan-400/30 break-words hover:text-yellow-200 hover:border-cyan-300 transition-colors duration-200 cursor-pointer"
            >
              https://github.com/Laboratorio-CE/cosmic-wings
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex flex-col gap-3 mb-4 sm:mb-6 px-2">
          <div className="bg-black/40 border border-cyan-400/30 rounded-lg p-3 sm:p-4 max-w-lg mx-auto">
            <strong className="text-yellow-300 text-center">Disclaimer:</strong>
            <p className="text-cyan-300 text-xs leading-relaxed">
              Este jogo é totalmente gratuito e foi desenvolvido para fins
              educativos. Todos os assets (imagens, sons e sprites) foram
              utilizados exclusivamente para aprender a desenvolver jogos e não
              possuem fins comerciais. Os links para todos os assets utilizados
              podem ser encontrados tanto aqui quanto no repositório do jogo.
              Agradecemos a todos os criadores dos assets que tornaram este projeto possível.
            </p>
            <br></br>
            <strong className="text-yellow-300">Sprites utilizados:</strong>
            <p className="text-cyan-300 text-xs leading-relaxed">
              Pixel Space Shooter by Ravenmore <br></br>
              <a
                href="https://ravenmore.itch.io/pixel-space-shooter-assets"
                className="hover:underline"
              >
                https://ravenmore.itch.io/pixel-space-shooter-assets
              </a>
            </p>
            <br></br>
            <strong className="text-yellow-300">
              Efeitos sonoros utilizados:
            </strong>
            <p className="text-cyan-300 text-xs leading-relaxed">
              Arcade Sound FX by Chequered Ink <br></br>
              <a
                href="https://ci.itch.io/arcade-sound-effects-pack"
                className="hover:underline"
              >
                https://ci.itch.io/arcade-sound-effects-pack
              </a>
            </p>
            <br></br>
            <strong className="text-yellow-300">Musicas utilizadas:</strong>
            <p className="text-cyan-300 text-xs leading-relaxed">
              Music by Eric Matyas <br></br>
              <a href="https://soundimage.org/"
                className="hover:underline"
              >
                https://soundimage.org/
              </a>
            </p>
          </div>
        </div>

        {/* Botão Voltar */}
        <button
          onClick={() => {
            playConfirmSound();
            onNavigateToMenu();
          }}
          onMouseEnter={() => setSelectedButton(0)}
          className={`relative flex items-center justify-center w-32 sm:w-40 p-2 sm:p-3 font-bold text-sm sm:text-base 
                  transition-all duration-200 cursor-pointer
                  ${
                    selectedButton === 0
                      ? "text-yellow-300 scale-105"
                      : "text-yellow-700 hover:text-yellow-300"
                  }
                  active:scale-100`}
        >
          <img
            src={imagemPlayer}
            alt="Nave selecionada"
            className="absolute left-0 w-5 sm:w-6 h-5 sm:h-6 rotate-90"
          />
          <span className="text-left w-full pl-6 sm:pl-8">VOLTAR</span>
        </button>
      </div>
    </div>
  );
};

export default Credits;