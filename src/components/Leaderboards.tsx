/* eslint-disable @typescript-eslint/no-empty-object-type */
import React, { Component } from "react";

type Props = {
  onNavigate: (route: string) => void;
}

type State = {}

export default class Leaderboards extends Component<Props, State> {
  state = {}

  render() {
    const { onNavigate } = this.props;

    return (
      <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-black/80 to-blue-900/90 border-2 border-cyan-400 rounded-2xl text-white font-mono shadow-2xl shadow-cyan-400/20">
        <h2 className="text-center text-cyan-400 text-3xl mb-8 font-bold tracking-widest">
          🏆 LEADERBOARDS
        </h2>
        
        <div className="space-y-4 mb-8">
          <div className="text-center text-gray-300">
            <p className="text-lg">Ranking em desenvolvimento...</p>
            <p className="text-sm mt-2">Em breve você poderá ver os melhores jogadores!</p>
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={() => onNavigate('/menu')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 border-2 border-cyan-400 rounded-lg text-white font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-400/20"
          >
            ← VOLTAR AO MENU
          </button>
        </div>
      </div>
    );
  }
}