import { Component } from "react";
import imagemPlayer from '../assets/images/player/player-frame-1.png';

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
    { label: "LEADERBOARDS", route: "/leaderboards" }
  ];

  state: State = {
    selectedIndex: 0,
    isPressed: false // Inicializa como false
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    const { selectedIndex } = this.state;
    const maxIndex = this.menuOptions.length - 1;

    switch (event.key) {
      case 'w':
      case 'W':
      case 'ArrowUp':
        event.preventDefault();
        this.setState({
          selectedIndex: selectedIndex > 0 ? selectedIndex - 1 : maxIndex
        });
        break;

      case 's':
      case 'S':
      case 'ArrowDown':
        event.preventDefault();
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
    this.setState({ selectedIndex: index });
  }

  render() {
    const { selectedIndex, isPressed } = this.state;

    return (
      <div className="max-w-md mx-auto p-8 bg-gradient-to-br from-black/80 to-blue-900/90 border-2 border-cyan-400 rounded-2xl text-white font-mono shadow-2xl shadow-cyan-400/20">
        <h1 className="text-center text-cyan-400 text-4xl mb-8 font-bold tracking-widest">
          COSMIC WINGS
        </h1>

        <nav className="space-y-4 flex flex-col items-center">
          {this.menuOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                this.setState({ selectedIndex: index });
                this.selectCurrentOption();
              }}
              onMouseEnter={() => this.handleMouseEnter(index)}
              className={`
                relative flex items-center justify-center w-64 p-3 font-bold text-lg transition-all duration-200 cursor-pointer
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
                  className="absolute left-0 w-8 h-8 rotate-90"
                />
              )}
              
              
              <span className="text-left w-full pl-12">
                {option.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="mt-8 text-center text-cyan-300 text-sm space-y-1">
          <p>Use W/S ou ↑/↓ para navegar</p>
          <p>ENTER ou ESPAÇO para selecionar</p>
        </div>
      </div>
    );
  }
}