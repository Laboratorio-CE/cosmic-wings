/* eslint-disable @typescript-eslint/no-empty-object-type */
import React, { Component } from 'react'

type Props = {
  onNavigate: (route: string) => void;
}

type State = {}

export default class GameCanvas extends Component<Props, State> {
  state = {}

  render() {
    const { onNavigate } = this.props;

    return (
      <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-black/80 to-blue-900/90 border-2 border-cyan-400 rounded-2xl text-white font-mono shadow-2xl shadow-cyan-400/20">
        <h1 className="text-center text-cyan-400 text-3xl mb-8 font-bold tracking-widest">
          🚀 COSMIC WINGS - JOGO
        </h1>
        
        <div className="text-center mb-8">
          <div className="bg-gray-800 rounded-lg p-8 mb-6">
            <p className="text-xl text-gray-300">Canvas do jogo será implementado aqui</p>
            <p className="text-sm text-gray-400 mt-2">Área de 800x600 pixels para o jogo</p>
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={() => onNavigate('/menu')}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-2 border-red-400 rounded-lg text-white font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-400/20"
          >
            ← SAIR DO JOGO
          </button>
        </div>
      </div>
    );
  }
}