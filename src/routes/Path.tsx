/* eslint-disable @typescript-eslint/no-empty-object-type */
import React, { Component } from 'react'
import Layout from '../components/Layout'
import Instructions from '../components/Instructions'
import Menu from '../components/Menu'
import GameCanvas from '../components/GameCanvas'
import Leaderboards from '../components/Leaderboards'

// Path não recebe props por enquanto
type Props = {}

// Path pode ter state para controlar qual tela mostrar
type State = {
  currentRoute: '/menu' | '/play' | '/instructions' | '/leaderboards';
}

export default class Path extends Component<Props, State> {
  state: State = {
    currentRoute: '/menu' // Começa mostrando o menu
  }

  // Função para navegar entre rotas
  handleNavigate = (route: string) => {
    this.setState({ currentRoute: route as '/menu' | '/play' | '/instructions' | '/leaderboards' });
  }

  // Função para renderizar o conteúdo baseado na rota
  renderContent = () => {
    const { currentRoute } = this.state;

    switch (currentRoute) {
      case '/menu':
        return <Menu onNavigate={this.handleNavigate} />;
      
      case '/play':
        return <GameCanvas onNavigate={this.handleNavigate} />;
      
      case '/instructions':
        return (
          <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-black/80 to-blue-900/90 border-2 border-cyan-400 rounded-2xl text-white font-mono shadow-2xl shadow-cyan-400/20">
            <Instructions onNavigate={this.handleNavigate} />
          </div>
        );
      
      case '/leaderboards':
        return <Leaderboards onNavigate={this.handleNavigate} />;
      
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