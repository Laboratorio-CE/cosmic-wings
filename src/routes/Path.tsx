/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Component } from 'react'
import Layout from '../components/Layout'
import Instructions from '../components/Instructions'
import Menu from '../components/Menu'
import GameCanvas from '../components/GameCanvas'
import Leaderboards from '../components/Leaderboards'
import RankingRegister from '../components/RankingRegister'
import Credits from '../components/Credits'

// Path não recebe props por enquanto
type Props = {}

// Path pode ter state para controlar qual tela mostrar
type State = {
  currentRoute: '/menu' | '/play' | '/instructions' | '/leaderboards' | '/ranking-register' | '/credits';
  gameScore?: number; // Para armazenar a pontuação do jogo
}

export default class Path extends Component<Props, State> {
  state: State = {
    currentRoute: '/menu', // Começa mostrando o menu
    gameScore: 0
  }

  // Função para navegar entre rotas
  handleNavigate = (route: string, data?: { score?: number }) => {
    if (route === '/ranking-register' && data?.score) {
      this.setState({ 
        currentRoute: route as '/menu' | '/play' | '/instructions' | '/leaderboards' | '/ranking-register' | '/credits',
        gameScore: data.score
      });
    } else {
      this.setState({ currentRoute: route as '/menu' | '/play' | '/instructions' | '/leaderboards' | '/ranking-register' | '/credits' });
    }
  }

  // Função para renderizar o conteúdo baseado na rota
  renderContent = () => {
    const { currentRoute, gameScore } = this.state;

    switch (currentRoute) {
      case '/menu':
        return <Menu onNavigate={this.handleNavigate} />;
      
      case '/play':
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
    return (
      <Layout starCount={1500}>
        {this.renderContent()}
      </Layout>
    )
  }
}