import { Component } from "react";
import imagemPlayer from "../assets/images/player/player-frame-1.png";

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
};

const generateLeaderboard = (): LeaderboardEntry[] => {
  const playerNames = [
    "COSMIC_WARRIOR", "STAR_SHOOTER", "GALAXY_HUNTER", "NEBULA_PILOT",
    "SPACE_ACE", "VOID_MASTER", "STELLAR_KNIGHT", "PLASMA_RIDER",
    "ASTRO_LEGEND", "METEOR_STORM", "NOVA_BLAST", "COSMIC_FURY",
    "STARLIGHT_HERO", "QUANTUM_PILOT", "GALACTIC_STORM", "SOLAR_FLARE",
    "DARK_MATTER", "PHOTON_STRIKE", "INFINITY_BLADE", "COSMIC_THUNDER",
    "STELLAR_FORCE", "WARP_SPEED", "BLACK_HOLE", "COMET_TAIL",
    "STAR_DUST", "ALPHA_CENTAURI", "ORION_HUNTER", "ANDROMEDA_SAGE",
    "MILKY_WAY", "SUPERNOVA", "RED_GIANT", "WHITE_DWARF",
    "PULSAR_BEAM", "QUASAR_LIGHT", "ASTEROID_KING", "PLANET_WALKER",
    "MOON_RIDER", "SUN_CHASER", "EARTH_GUARDIAN", "MARS_CONQUEROR",
    "JUPITER_STORM", "SATURN_RING", "URANUS_WIND", "NEPTUNE_TIDE",
    "PLUTO_SHADOW", "ROCKET_MAN", "SPACE_RANGER", "COSMIC_EXPLORER",
    "STAR_NAVIGATOR", "GALAXY_DEFENDER"
  ];

  return Array.from({ length: 50 }, (_, index) => {
    const position = index + 1;
    const baseScore = 100000 - (position - 1) * 1500;
    const randomVariation = Math.floor(Math.random() * 1000);
    const score = baseScore + randomVariation;
    
    const days = Math.floor(Math.random() * 30) + 1;
    const month = Math.floor(Math.random() * 12) + 1;
    const date = `${days.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/2024`;
    
    return {
      position,
      player: playerNames[index],
      score,
      date
    };
  });
};

export default class Leaderboards extends Component<Props, State> {
  state: State = {
    isPressed: true,
    leaderboard: generateLeaderboard()
  };
  componentDidMount() {
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

              {/* Linhas da tabela */}
              <div className="max-h-full">
                {this.state.leaderboard.map((entry, index) => (
                  <div 
                    key={entry.position}
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
                ))}
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