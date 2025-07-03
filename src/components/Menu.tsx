/* eslint-disable @typescript-eslint/no-empty-object-type */
import React, { Component } from "react";

// Props para receber função de navegação do componente pai
type Props = {
  onNavigate: (route: string) => void;
}

type State = {}

export default class Menu extends Component<Props, State> {
  state = {}

  render() {
    const { onNavigate } = this.props;

    return (
      <div className="max-w-md mx-auto p-8 bg-gradient-to-br from-black/80 to-blue-900/90 border-2 border-cyan-400 rounded-2xl text-white font-mono shadow-2xl shadow-cyan-400/20">
        <h1 className="text-center text-cyan-400 text-4xl mb-8 font-bold tracking-widest">
          COSMIC WINGS
        </h1>

        <nav className="space-y-4 flex flex-col items-center">
          <button
            onClick={() => onNavigate("/play")}
            className="p-2 text-yellow-700 font-bold text-lg transition-all hover:text-yellow-500 cursor-pointer w-fit"
          >
            INICIAR JOGO
          </button>

          <button
            onClick={() => onNavigate("/instructions")}
            className="p-2 text-yellow-700 font-bold text-lg transition-all hover:text-yellow-500 cursor-pointer w-fit"
          >
          COMO JOGAR
          </button>

          <button
            onClick={() => onNavigate("/leaderboards")}
            className="p-2 text-yellow-700 font-bold text-lg transition-all hover:text-yellow-500 cursor-pointer w-fit"
          >
          LEADERBOARDS
          </button>
        </nav>

        <div className="mt-8 text-center text-cyan-300 text-sm">
          <p>Use as teclas ou clique para navegar</p>
        </div>
      </div>
    );
  }
}