import { Component } from "react";
import imagemPlayer from "../assets/images/player/player-frame-1.png";
import { find } from "../services/supabaseService";
import AudioManager from '../services/AudioManager';

type Props = {
  onNavigate?: (route: string) => void;
}

type LeaderboardEntry = {
  position: number;
  player: string;
  score: number;
  date: string;
};

type State = {
  isPressed: boolean;
  leaderboard: LeaderboardEntry[];
  loading: boolean;
};

export default class Leaderboards extends Component<Props, State> {
  private audioManager: AudioManager;
  private gamepadIndex: number | null = null;
  private gamepadInterval: number | null = null;
  private lastButtonState = false;

  state: State = {
    isPressed: true,
    leaderboard: [],
    loading: true
  };

  constructor(props: Props) {
    super(props);
    this.audioManager = AudioManager.getInstance();
  }

  // Método para reproduzir som de confirmação
  private playConfirmSound = () => {
    try {
      this.audioManager.playSoundEffect('menu-confirm');
    } catch (error) {
      console.error('Erro ao reproduzir som de confirmação:', error);
    }
  }

  // Função para formatar a data do formato ISO para DD/MM/YYYY
  formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Função para carregar dados do Supabase
  loadLeaderboardData = async (): Promise<void> => {
    try {
      this.setState({ loading: true });
      const data = await find();
      
      const formattedData: LeaderboardEntry[] = data.map((entry, index) => ({
        position: index + 1,
        player: entry.player_name,
        score: entry.player_score,
        date: this.formatDate(entry.created_at || new Date().toISOString())
      }));

      this.setState({ 
        leaderboard: formattedData,
        loading: false 
      });
    } catch (error) {
      console.error('Erro ao carregar leaderboard:', error);
      this.setState({ 
        leaderboard: [],
        loading: false 
      });
    }
  };

  componentDidMount() {
    // Carregar dados do leaderboard
    this.loadLeaderboardData();
    
    if (this.props.onNavigate) {
      document.addEventListener("keydown", this.handleKeyDown);
      this.setupGamepad();
    }
  }

  componentWillUnmount() {
    if (this.props.onNavigate) {
      document.removeEventListener("keydown", this.handleKeyDown);
      if (this.gamepadInterval !== null) {
        clearInterval(this.gamepadInterval);
      }
    }
  }

  setupGamepad = () => {
    window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
      this.gamepadIndex = e.gamepad.index;
    });

    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        this.gamepadIndex = i;
        break;
      }
    }

    this.gamepadInterval = window.setInterval(this.pollGamepad, 100);
  }

  pollGamepad = () => {
    if (this.gamepadIndex === null) return;

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[this.gamepadIndex];
    if (!gamepad) return;

    const anyButton = gamepad.buttons[0]?.pressed || 
                      gamepad.buttons[1]?.pressed || 
                      gamepad.buttons[2]?.pressed || 
                      gamepad.buttons[3]?.pressed ||
                      gamepad.buttons[9]?.pressed; // Start button

    if (anyButton && !this.lastButtonState) {
      this.animatePress();
    }

    this.lastButtonState = anyButton;
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (!this.props.onNavigate) return;

    switch (event.key) {
      case "Enter":
      case "f":
      case "F":
      case "5":
      case " ":
      case "Escape":
        event.preventDefault();
        this.animatePress();
        break;
      default:
        break;
    }
  };

  animatePress = () => {
    // Reproduzir som de confirmação
    this.playConfirmSound();
    
    this.setState({ isPressed: false });

    setTimeout(() => {
      this.setState({ isPressed: true });
      this.props.onNavigate!("/menu");
    }, 150);
  };

  render() {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 bg-gradient-to-br from-black/80 to-blue-900/90 border-2 border-cyan-400 rounded-2xl text-white font-mono shadow-2xl shadow-cyan-400/20 h-screen md:h-[600px] overflow-y-auto scrollbar-styled">
        <div className="h-full flex flex-col">
          {/* Título - 10% da altura */}
          <div className="flex-shrink-0 flex items-center justify-center border-b border-cyan-400/30 px-4 py-4">
            <h2 className="text-cyan-400 text-xl sm:text-3xl font-bold tracking-widest cursor-default text-center">
              LEADERBOARDS
            </h2>
          </div>

          {/* Lista - conteúdo flexível */}
          <div className="flex-1 p-4 overflow-y-auto scrollbar-styled cursor-default min-h-0">
            <div className="overflow-hidden rounded-lg border border-cyan-400/20">
              {/* Cabeçalho da tabela */}
              <div className="bg-cyan-400/10 border-b border-cyan-400/30 p-2 sm:p-2 grid grid-cols-4 gap-2 sm:gap-4 text-cyan-400 font-bold text-xs sm:text-sm">
                <div className="text-center">POS</div>
                <div className="text-left">PLAYER</div>
                <div className="text-center hidden sm:block">PONTUAÇÃO</div>
                <div className="text-center sm:hidden">SCORE</div>
                <div className="text-center">DATA</div>
              </div>

              {/* Conteúdo da tabela */}
              <div className="max-h-full">
                {this.state.loading ? (
                  // Animação de loading
                  <div className="flex flex-col items-center justify-center py-8 sm:py-16">
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
                      <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-transparent border-r-cyan-400/60 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <p className="text-cyan-400 text-sm sm:text-lg font-bold tracking-wider animate-pulse text-center">
                      CARREGANDO...
                    </p>
                    <div className="flex space-x-1 mt-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                ) : this.state.leaderboard.length === 0 ? (
                  // Estado vazio
                  <div className="flex flex-col items-center justify-center py-8 sm:py-16">
                    <p className="text-cyan-400 text-sm sm:text-lg font-bold tracking-wider text-center">
                      NENHUM DADO ENCONTRADO
                    </p>
                    <p className="text-white/60 text-xs sm:text-sm mt-2 text-center px-2">
                      Seja o primeiro a marcar pontos!
                    </p>
                  </div>
                ) : (
                  // Linhas da tabela com dados
                  this.state.leaderboard.map((entry, index) => (
                    <div 
                      key={`${entry.player}-${entry.score}-${index}`}
                      className={`
                        grid grid-cols-4 gap-2 sm:gap-4 p-2 sm:p-2 text-xs sm:text-sm border-b border-cyan-400/10 transition-colors duration-200 hover:bg-cyan-400/5 
                        ${index < 3 ? 'text-yellow-300' : 'text-white'}
                      `}
                    >
                      <div className="text-center font-bold">
                        {entry.position === 1 && '🥇'}
                        {entry.position === 2 && '🥈'}
                        {entry.position === 3 && '🥉'}
                        {entry.position > 3 && entry.position}
                      </div>
                      <div className="text-left overflow-x-auto font-mono text-xs sm:text-sm" title={entry.player}>
                        {entry.player}
                      </div>
                      <div className="text-center font-bold">
                        <span className="hidden sm:inline">{entry.score.toLocaleString()}</span>
                        <span className="sm:hidden">{entry.score >= 1000000 ? `${(entry.score / 1000000).toFixed(1)}M` : entry.score >= 1000 ? `${(entry.score / 1000).toFixed(1)}K` : entry.score.toString()}</span>
                      </div>
                      <div className="text-center text-xs sm:text-sm">
                        <span className="hidden sm:inline">{entry.date}</span>
                        <span className="sm:hidden">{entry.date.replace(/\//g, '/')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Botão - rodapé fixo */}
          <div className="flex-shrink-0 flex items-center justify-center border-t border-cyan-400/30 px-4 py-4">
            {this.props.onNavigate && (
              <button
                onClick={() => {
                  this.playConfirmSound();
                  this.animatePress();
                }}
                className={`
                  relative flex items-center justify-center w-full max-w-56 p-2 font-bold text-sm sm:text-base transition-all duration-200 cursor-pointer text-yellow-300
                  ${this.state.isPressed ? "scale-105" : "scale-100"}
                  active:scale-100
                `}
              >
                <img
                  src={imagemPlayer}
                  alt="Nave selecionada"
                  className="absolute left-0 w-5 h-5 sm:w-7 sm:h-7 rotate-90"
                />
                <span className="w-full pl-8 sm:pl-10 text-center sm:text-left">
                  <span className="hidden sm:inline">VOLTAR AO MENU</span>
                  <span className="sm:hidden">VOLTAR</span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}