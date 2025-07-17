import { Component } from "react";
import imagemPlayer from '../assets/images/player/player-frame-1.png'
import imagemDisparo from '../assets/images/effects/player-fire.png'
import imagemInimigo from '../assets/images/enemy/enemy-C-frame-1.png'
import imagemBoss from '../assets/images/enemy/boss-C-frame-1.png'
import AudioManager from '../services/AudioManager';

type Props = {
  onNavigate?: (route: string) => void;
}

type State = {
  isPressed: boolean; 
}

export default class Instructions extends Component<Props, State> {
  private audioManager: AudioManager;

  state: State = {
    isPressed: true 
  }

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

  componentDidMount() {
    if (this.props.onNavigate) {
      document.addEventListener('keydown', this.handleKeyDown);
    }
  }

  componentWillUnmount() {
    if (this.props.onNavigate) {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (!this.props.onNavigate) return;

    switch (event.key) {
      case 'Enter':
      case 'f':
      case 'F':
      case '5':
      case ' ':
      case 'Escape': 
        event.preventDefault();
        this.animatePress();
        break;
      default:
        break;
    }
  }

  animatePress = () => {
    // Reproduzir som de confirmação
    this.playConfirmSound();
    
    this.setState({ isPressed: false });
    
    setTimeout(() => {
      this.setState({ isPressed: true });
      this.props.onNavigate!('/menu');
    }, 150);
  }

  render() {
    return (
      <div className="max-w-lg mx-auto p-4 bg-gradient-to-br from-black/80 to-blue-900/90 border-2 border-cyan-400 rounded-2xl text-white font-mono shadow-2xl shadow-cyan-400/20 h-screen md:h-[600px] overflow-y-auto scrollbar-styled">
        <h2 className="text-center text-cyan-400 text-xl mb-4 font-bold tracking-widest cursor-default">
          COMO JOGAR
        </h2>

        <div className="mb-4 p-3 bg-white/5 border-l-4 border-cyan-400 rounded-lg transition-all duration-300 hover:bg-white/10 hover:translate-x-2 hover:shadow-lg hover:shadow-cyan-400/20 cursor-default">
          <div className="flex items-center mb-3 gap-4">
            <img
              src={imagemPlayer}
              alt="Imagem da nave do jogador"
              className="w-8 h-8"
            />
            <h3 className="text-orange-400 text-lg font-semibold">
              Movimentação
            </h3>
          </div>
          <p className="text-sm leading-relaxed">
            Utilize as teclas{" "}
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              W
            </strong>
            ,{" "}
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              A
            </strong>
            ,{" "}
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              S
            </strong>
            ,{" "}
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              D
            </strong>{" "}
            ou as setas de direção do teclado (
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              ←
            </strong>
            ,{" "}
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              ↑
            </strong>
            ,{" "}
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              ↓
            </strong>
            ,{" "}
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              →
            </strong>
            ) para movimentar a nave
          </p>
        </div>

        <div className="mb-4 p-3 bg-white/5 border-l-4 border-cyan-400 rounded-lg transition-all duration-300 hover:bg-white/10 hover:translate-x-2 hover:shadow-lg hover:shadow-cyan-400/20 cursor-default">
          <div className="flex items-center mb-3 gap-4">
            <img
              src={imagemDisparo}
              alt="Imagem do disparo do jogador"
              className="w-3 h-8"
            />
            <h3 className="text-orange-400 text-lg font-semibold">Disparos</h3>
          </div>
          <p className="text-sm leading-relaxed">
            Atire com a{" "}
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              barra de espaço
            </strong>
            , tecla{" "}
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              F
            </strong>{" "}
            ou número{" "}
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              5
            </strong>{" "}
            do teclado numérico
          </p>
        </div>

        <div className="mb-4 p-3 bg-white/5 border-l-4 border-cyan-400 rounded-lg transition-all duration-300 hover:bg-white/10 hover:translate-x-2 hover:shadow-lg hover:shadow-cyan-400/20 cursor-default">
          <div className="flex items-center mb-3 gap-4">
            <img
              src={imagemInimigo}
              alt="Imagem de uma nave inimiga"
              className="w-8 h-8"
            />
            <h3 className="text-orange-400 text-lg font-semibold">Inimigos</h3>
          </div>
          <p className="text-sm leading-relaxed">
            Desvie dos disparos inimigos e derrote as naves inimigas
          </p>
        </div>

        <div className="mb-4 p-3 bg-white/5 border-l-4 border-cyan-400 rounded-lg transition-all duration-300 hover:bg-white/10 hover:translate-x-2 hover:shadow-lg hover:shadow-cyan-400/20 cursor-default">
          <div className="flex items-center mb-3 gap-4">
            <img
              src={imagemBoss}
              alt="Imagem de um chefe inimigo"
              className="w-8 h-8"
            />
            <h3 className="text-orange-400 text-lg font-semibold">Chefes</h3>
          </div>
          <p className="text-sm leading-relaxed">
            Após derrotar inimigos suficientes, um chefe desafiará você
          </p>
        </div>

        <div className="mb-4 p-3 bg-white/5 border-l-4 border-cyan-400 rounded-lg transition-all duration-300 hover:bg-white/10 hover:translate-x-2 hover:shadow-lg hover:shadow-cyan-400/20 cursor-default">
          <div className="flex items-center mb-3 gap-4">
            <img
              src={imagemPlayer}
              alt="Imagem da nave do jogador"
              className="w-8 h-8"
            />
            <h3 className="text-orange-400 text-lg font-semibold">Pontuação</h3>
          </div>
          <p className="text-sm leading-relaxed">
            Alcance a maior pontuação que conseguir
          </p>
        </div>

        {this.props.onNavigate && (
          <div className="text-center mt-6">
            <button
              onClick={() => {
                this.playConfirmSound();
                this.animatePress();
              }}
              className={`
                relative flex items-center justify-center w-56 p-2 font-bold text-base transition-all duration-200 cursor-pointer mx-auto text-yellow-300
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
          </div>
        )}
      </div>
    );
  }
}