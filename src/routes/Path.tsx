/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Component } from 'react'
import Layout from '../components/Layout'
import Instructions from '../components/Instructions'
import Menu from '../components/Menu'
import GameCanvas from '../components/GameCanvas'
import Leaderboards from '../components/Leaderboards'
import RankingRegister from '../components/RankingRegister'
import Credits from '../components/Credits'

// Importar música do menu
import menuMusic from '../assets/audios/music/ost-menu.mp3';

// Path não recebe props por enquanto
type Props = {}

// Path pode ter state para controlar qual tela mostrar
type State = {
  currentRoute: '/menu' | '/play' | '/instructions' | '/leaderboards' | '/ranking-register' | '/credits';
  gameScore?: number; // Para armazenar a pontuação do jogo
  gameState: 'preparing' | 'playing' | 'paused' | 'gameOver';
}

export default class Path extends Component<Props, State> {
  private backgroundMusic: HTMLAudioElement | null = null;

  state: State = {
    currentRoute: '/menu', // Começa mostrando o menu
    gameScore: 0,
    gameState: 'preparing'
  }

  componentDidMount() {
    // Event listener para sincronizar estado do jogo
    window.addEventListener('gameStateChange', this.handleGameStateChange as EventListener);
    
    // Iniciar música do menu
    this.startBackgroundMusic();
  }

  componentWillUnmount() {
    window.removeEventListener('gameStateChange', this.handleGameStateChange as EventListener);
    
    // Limpar música de fundo
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic = null;
    }
  }

  // Método para iniciar música de fundo
  private startBackgroundMusic = () => {
    // Verificar se a música já está tocando para evitar sobreposição
    if (this.backgroundMusic && !this.backgroundMusic.paused) {
      return;
    }

    try {
      this.backgroundMusic = new Audio(menuMusic);
      this.backgroundMusic.volume = 0.1; // Volume baixo para música de fundo
      this.backgroundMusic.loop = true; // Tocar em loop
      this.backgroundMusic.play().catch(error => {
        console.log('Erro ao reproduzir música de fundo:', error);
      });
    } catch (error) {
      console.log('Erro ao criar áudio de música de fundo:', error);
    }
  }

  // Método para parar música de fundo gradualmente (fade out)
  private stopBackgroundMusic = () => {
    if (this.backgroundMusic) {
      const fadeOutDuration = 1000; // 1 segundo para fade out
      const fadeSteps = 20;
      const volumeStep = this.backgroundMusic.volume / fadeSteps;
      const stepDuration = fadeOutDuration / fadeSteps;

      const fadeInterval = setInterval(() => {
        if (this.backgroundMusic && this.backgroundMusic.volume > volumeStep) {
          this.backgroundMusic.volume -= volumeStep;
        } else {
          clearInterval(fadeInterval);
          if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic = null;
          }
        }
      }, stepDuration);
    }
  }

  // Função para sincronizar estado do jogo
  handleGameStateChange = (event: Event) => {
    const customEvent = event as CustomEvent;
    this.setState({ gameState: customEvent.detail.gameState });
  }

  // Função para navegar entre rotas
  handleNavigate = (route: string, data?: { score?: number }) => {
    // Controlar música baseado na rota
    if (route === '/play') {
      // Parar música gradualmente quando for para o jogo
      this.stopBackgroundMusic();
    } else if (this.state.currentRoute === '/play' && route !== '/play') {
      // Iniciar música quando sair do jogo para qualquer outra tela
      this.startBackgroundMusic();
    }

    if (route === '/ranking-register' && data?.score) {
      this.setState({ 
        currentRoute: route as '/menu' | '/play' | '/instructions' | '/leaderboards' | '/ranking-register' | '/credits',
        gameScore: data.score
      });
    } else {
      this.setState({ currentRoute: route as '/menu' | '/play' | '/instructions' | '/leaderboards' | '/ranking-register' | '/credits' });
    }
  }

  // Função para alternar a pausa do jogo
  handleTogglePause = () => {
    // Dispatcha um evento customizado para o GameCanvas
    window.dispatchEvent(new CustomEvent('toggleGamePause'));
  }

  // Função para renderizar o conteúdo baseado na rota
  renderContent = () => {
    const { currentRoute, gameScore } = this.state;

    switch (currentRoute) {
      case '/menu':
        return <Menu onNavigate={this.handleNavigate} />;
      
      case '/play':
        // Reset do estado do jogo apenas quando entrar na tela de jogo pela primeira vez
        // Não resetar se o jogo já estiver rodando (playing/paused)
        if (this.state.gameState !== 'preparing' && 
            this.state.gameState !== 'playing' && 
            this.state.gameState !== 'paused') {
          this.setState({ gameState: 'preparing' });
        }
        return <GameCanvas onNavigate={this.handleNavigate} />;
      
      case '/instructions':
        return <Instructions onNavigate={this.handleNavigate} />;
      
      case '/leaderboards':
        return <Leaderboards onNavigate={this.handleNavigate} />;
      
      case '/ranking-register':
        return <RankingRegister 
          score={gameScore || 0} 
          onNavigateToMenu={() => this.handleNavigate('/menu')} 
        />;
      
      case '/credits':
        return <Credits onNavigateToMenu={() => this.handleNavigate('/menu')} />;
      
      default:
        return <Menu onNavigate={this.handleNavigate} />;
    }
  }

  render() {
    const { currentRoute, gameState } = this.state;
    
    return (
      <Layout 
        starCount={1500} 
        currentRoute={currentRoute}
        gameState={gameState}
        onTogglePause={this.handleTogglePause}
      >
        {this.renderContent()}
      </Layout>
    )
  }
}