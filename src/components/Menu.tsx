import { Component } from "react";
import imagemPlayer from '../assets/images/player/player-frame-1.png';
import AudioManager from '../services/AudioManager';

// Props para receber função de navegação do componente pai
type Props = {
  onNavigate: (route: string) => void;
}

type State = {
  selectedIndex: number;
  isPressed: boolean; // Novo estado para simular o efeito de pressionar
}

interface MenuOption {
  label: string;
  route: string;
}

export default class Menu extends Component<Props, State> {
  private menuOptions: MenuOption[] = [
    { label: "INICIAR JOGO", route: "/play" },
    { label: "COMO JOGAR", route: "/instructions" },
    { label: "LEADERBOARDS", route: "/leaderboards" },
    { label: "CRÉDITOS", route: "/credits" }
  ];

  private audioManager: AudioManager;

  state: State = {
    selectedIndex: 0,
    isPressed: false // Inicializa como false
  }

  constructor(props: Props) {
    super(props);
    this.audioManager = AudioManager.getInstance();
  }

  // Método para reproduzir som de navegação
  private playNavigateSound = () => {
    try {
      this.audioManager.playSoundEffect('menu-navigate');
    } catch (error) {
      console.log('Erro ao reproduzir som de navegação:', error);
    }
  }

  // Método para reproduzir som de confirmação
  private playConfirmSound = () => {
    try {
      this.audioManager.playSoundEffect('menu-confirm');
    } catch (error) {
      console.log('Erro ao reproduzir som de confirmação:', error);
    }
  }

  // Método para tentar iniciar música após primeira interação
  private handleFirstInteraction = () => {
    this.audioManager.tryStartPendingMusic();
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    // Não pausar a música aqui - deixar tocando para outras telas
    // A música só será pausada quando navegar especificamente para "/play"
  }

  handleKeyDown = (event: KeyboardEvent) => {
    // Tentar iniciar música na primeira interação
    this.handleFirstInteraction();
    
    const { selectedIndex } = this.state;
    const maxIndex = this.menuOptions.length - 1;

    switch (event.key) {
      case 'w':
      case 'W':
      case 'ArrowUp':
        event.preventDefault();
        // Reproduzir som de navegação
        this.playNavigateSound();
        this.setState({
          selectedIndex: selectedIndex > 0 ? selectedIndex - 1 : maxIndex
        });
        break;

      case 's':
      case 'S':
      case 'ArrowDown':
        event.preventDefault();
        // Reproduzir som de navegação
        this.playNavigateSound();
        this.setState({
          selectedIndex: selectedIndex < maxIndex ? selectedIndex + 1 : 0
        });
        break;

      case 'Enter':
      case 'f':
      case 'F':
      case '5':
      case ' ': 
        event.preventDefault();
        // Reproduzir som de confirmação
        this.playConfirmSound();
        this.animatePress(); // Adiciona animação antes de selecionar
        break;

      default:
        break;
    }
  }

  selectCurrentOption = () => {
    const { selectedIndex } = this.state;
    const selectedOption = this.menuOptions[selectedIndex];
    
    this.props.onNavigate(selectedOption.route);
  }

  
  animatePress = () => {
    this.setState({ isPressed: true });
    
    
    setTimeout(() => {
      this.setState({ isPressed: false });
      this.selectCurrentOption();
    }, 150);
  }

  handleMouseEnter = (index: number) => {
    // Tentar iniciar música na primeira interação
    this.handleFirstInteraction();
    
    // Só reproduzir som se a opção realmente mudou
    if (this.state.selectedIndex !== index) {
      this.playNavigateSound();
    }
    this.setState({ selectedIndex: index });
  }

  render() {
    const { selectedIndex, isPressed } = this.state;

    return (
      <div className="flex justify-center items-center h-full w-full min-h-0 p-0 sm:p-4">
        <div className="w-full h-full sm:w-auto sm:max-w-md sm:h-auto p-0 sm:p-8 bg-gradient-to-br from-black/80 to-blue-900/90 border-2 border-cyan-400 rounded-2xl text-white font-mono shadow-2xl shadow-cyan-400/20 flex flex-col justify-center overflow-hidden">
          <h1 className="text-center text-cyan-400 text-2xl sm:text-4xl mb-8 font-bold tracking-widest pt-12 sm:pt-0 px-4 sm:px-0">
            COSMIC WINGS
          </h1>

          <nav className="space-y-4 flex flex-col items-center flex-1 justify-center w-full sm:px-0">
            {this.menuOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  // Tentar iniciar música na primeira interação
                  this.handleFirstInteraction();
                  // Reproduzir som de confirmação
                  this.playConfirmSound();
                  // Em mobile, apenas seleciona se for diferente do atual
                  if (window.innerWidth < 640) { // sm breakpoint
                    if (selectedIndex !== index) {
                      this.setState({ selectedIndex: index });
                      return;
                    }
                  }
                  // Desktop ou mobile com mesma opção - executa imediatamente
                  this.setState({ selectedIndex: index });
                  // Reproduzir som de confirmação
                  this.playConfirmSound();
                  this.selectCurrentOption();
                }}
                onMouseEnter={() => this.handleMouseEnter(index)}
                className={`
                  relative flex items-center justify-center w-full p-0 sm:p-3 font-bold text-base sm:text-lg transition-all duration-200 cursor-pointer
                  ${selectedIndex === index 
                    ? `text-yellow-300 ${isPressed ? 'scale-100' : 'scale-105'}` 
                    : 'text-yellow-700 hover:text-yellow-300'
                  }
                  active:scale-100
                `}
              >

                {selectedIndex === index && (
                  <img 
                    src={imagemPlayer} 
                    alt="Nave selecionada" 
                    className="absolute left-8 sm:left-0 w-6 h-6 sm:w-8 sm:h-8 rotate-90 top-1/2 transform -translate-y-1/2"
                  />
                )}
                
                
                <span className="w-full py-3 pl-5 pr-4 sm:pl-6 text-center sm:text-center">
                  {option.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="mt-8 text-center text-cyan-300 text-xs sm:text-sm space-y-1 pb-4 sm:pb-0 px-4 sm:px-0">
            <p className="hidden sm:block">Use W/S ou ↑/↓ para navegar</p>
            <p className="hidden sm:block">ENTER, F, 5 ou ESPAÇO para selecionar</p>
            <p className="sm:hidden">Toque duas vezes para selecionar</p>
          </div>
        </div>
      </div>
    );
  }
}