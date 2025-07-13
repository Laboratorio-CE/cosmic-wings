/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Component } from 'react'
import Layout from '../components/Layout'
import Instructions from '../components/Instructions'
import Menu from '../components/Menu'
import GameCanvas from '../components/GameCanvas'
import Leaderboards from '../components/Leaderboards'
import RankingRegister from '../components/RankingRegister'
import Credits from '../components/Credits'
import AudioManager from '../services/AudioManager'

// Path não recebe props por enquanto
type Props = {}

// Path pode ter state para controlar qual tela mostrar
type State = {
  currentRoute: '/menu' | '/play' | '/instructions' | '/leaderboards' | '/ranking-register' | '/credits';
  gameScore?: number; // Para armazenar a pontuação do jogo
  gameState: 'preparing' | 'playing' | 'paused' | 'gameOver';
}

export default class Path extends Component<Props, State> {
  private audioManager: AudioManager;

  state: State = {
    currentRoute: '/menu', // Começa mostrando o menu
    gameScore: 0,
    gameState: 'preparing'
  }

  constructor(props: Props) {
    super(props);
    this.audioManager = AudioManager.getInstance();
  }

  componentDidMount() {
    // Event listener para sincronizar estado do jogo
    window.addEventListener('gameStateChange', this.handleGameStateChange as EventListener);
    
    // Tentar iniciar música do menu imediatamente
    this.audioManager.playBackgroundMusic('menu').catch(() => {
      console.log('Música será reproduzida após primeira interação do usuário');
    });

    // Adicionar listener para tentar iniciar música em qualquer interação inicial
    const handleFirstInteraction = () => {
      this.audioManager.markUserInteraction();
      // Remover listeners após primeira interação
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
  }

  componentWillUnmount() {
    window.removeEventListener('gameStateChange', this.handleGameStateChange as EventListener);
    
    // Limpar recursos de áudio
    this.audioManager.dispose();
  }

  // Função para sincronizar estado do jogo
  handleGameStateChange = (event: Event) => {
    const customEvent = event as CustomEvent;
    this.setState({ gameState: customEvent.detail.gameState });
  }

  // Função para navegar entre rotas
  handleNavigate = async (route: string, data?: { score?: number }) => {
    // Controlar música baseado na rota
    if (route === '/play') {
      // Parar música gradualmente quando for para o jogo
      this.audioManager.stopBackgroundMusic();
    } else if (this.state.currentRoute === '/play' && route !== '/play') {
      // Iniciar música quando sair do jogo para qualquer outra tela
      try {
        await this.audioManager.playBackgroundMusic('menu');
      } catch (error) {
        console.log('Erro ao iniciar música na navegação:', error);
      }
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
          onNavigateToLeaderboards={() => this.handleNavigate('/leaderboards')}
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