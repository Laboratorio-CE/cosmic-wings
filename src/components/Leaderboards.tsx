import { Component } from "react";
import imagemPlayer from "../assets/images/player/player-frame-1.png";
import { find } from "../services/supabaseService";

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
  state: State = {
    isPressed: true,
    leaderboard: [],
    loading: true
  };

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
    }
  }

  componentWillUnmount() {
    if (this.props.onNavigate) {
      document.removeEventListener("keydown", this.handleKeyDown);
    }
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
    this.setState({ isPressed: false });

    setTimeout(() => {
      this.setState({ isPressed: true });
      this.props.onNavigate!("/menu");
    }, 150);
  };

  render() {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div 
          className="bg-gradient-to-br from-black/80 to-blue-900/90 border-2 border-cyan-400 rounded-2xl text-white font-mono shadow-2xl shadow-cyan-400/20"
          style={{ width: '800px', height: '600px' }}
        >
          {/* Título - 10% da altura */}
          <div className="h-[10%] flex items-center justify-center border-b border-cyan-400/30">
            <h2 className="text-cyan-400 text-3xl font-bold tracking-widest cursor-default">
              LEADERBOARDS
            </h2>
          </div>

          {/* Lista - 80% da altura */}
          <div className="h-[80%] p-4 overflow-y-auto scrollbar-hide cursor-default">
            <div className="overflow-hidden rounded-lg border border-cyan-400/20">
              {/* Cabeçalho da tabela */}
              <div className="bg-cyan-400/10 border-b border-cyan-400/30 p-2 grid grid-cols-4 gap-4 text-cyan-400 font-bold text-sm">
                <div className="text-center">POSITION</div>
                <div className="text-left">PLAYER</div>
                <div className="text-center">PONTUAÇÃO</div>
                <div className="text-center">DATA</div>
              </div>

              {/* Conteúdo da tabela */}
              <div className="max-h-full">
                {this.state.loading ? (
                  // Animação de loading
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
                      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-cyan-400/60 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <p className="text-cyan-400 text-lg font-bold tracking-wider animate-pulse">
                      CARREGANDO DADOS...
                    </p>
                    <div className="flex space-x-1 mt-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                ) : this.state.leaderboard.length === 0 ? (
                  // Estado vazio
                  <div className="flex flex-col items-center justify-center py-16">
                    <p className="text-cyan-400 text-lg font-bold tracking-wider">
                      NENHUM DADO ENCONTRADO
                    </p>
                    <p className="text-white/60 text-sm mt-2">
                      Seja o primeiro a marcar pontos!
                    </p>
                  </div>
                ) : (
                  // Linhas da tabela com dados
                  this.state.leaderboard.map((entry, index) => (
                    <div 
                      key={`${entry.player}-${entry.score}-${index}`}
                      className={`
                        grid grid-cols-4 gap-4 p-2 text-sm border-b border-cyan-400/10 transition-colors duration-200 hover:bg-cyan-400/5 
                        ${index < 3 ? 'text-yellow-300' : 'text-white'}
                      `}
                    >
                      <div className="text-center font-bold">
                        {entry.position === 1 && '🥇'}
                        {entry.position === 2 && '🥈'}
                        {entry.position === 3 && '🥉'}
                        {entry.position > 3 && entry.position}
                      </div>
                      <div className="text-left truncate font-mono" title={entry.player}>
                        {entry.player}
                      </div>
                      <div className="text-center font-bold">
                        {entry.score.toLocaleString()}
                      </div>
                      <div className="text-center">
                        {entry.date}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Botão - 10% da altura */}
          <div className="h-[10%] flex items-center justify-center border-t border-cyan-400/30">
            {this.props.onNavigate && (
              <button
                onClick={() => this.animatePress()}
                className={`
                  relative flex items-center justify-center w-56 p-2 font-bold text-base transition-all duration-200 cursor-pointer text-yellow-300
                  ${this.state.isPressed ? "scale-105" : "scale-100"}
                  active:scale-100
                `}
              >
                <img
                  src={imagemPlayer}
                  alt="Nave selecionada"
                  className="absolute left-0 w-7 h-7 rotate-90"
                />
                <span className="text-left w-full pl-10">VOLTAR AO MENU</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}