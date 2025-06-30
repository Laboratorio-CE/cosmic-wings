/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Component } from 'react'

type Props = {}

type State = {}

export default class Instructions extends Component<Props, State> {
  state = {}

  render() {
    return (
      <div>
        <h2 className="text-center text-cyan-400 text-3xl mb-8 font-bold tracking-widest">
          Como Jogar - Cosmic Wings
        </h2>
        
        <div className="mb-6 p-4 bg-white/5 border-l-4 border-cyan-400 rounded-lg transition-all duration-300 hover:bg-white/10 hover:translate-x-2 hover:shadow-lg hover:shadow-cyan-400/20">
          <h3 className="text-orange-400 text-xl mb-2 font-semibold">
            🎮 Movimentação
          </h3>
          <p className="leading-relaxed">
            Utilize as teclas <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">W</strong>, <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">A</strong>, <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">S</strong>, <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">D</strong> ou 
            as setas de direção do teclado (<strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">←</strong>, <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">↑</strong>, <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">↓</strong>, <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">→</strong>) para movimentar
          </p>
        </div>

        <div className="mb-6 p-4 bg-white/5 border-l-4 border-cyan-400 rounded-lg transition-all duration-300 hover:bg-white/10 hover:translate-x-2 hover:shadow-lg hover:shadow-cyan-400/20">
          <h3 className="text-orange-400 text-xl mb-2 font-semibold">
            🚀 Disparos
          </h3>
          <p className="leading-relaxed">
            Atire com a <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">barra de espaço</strong>, tecla <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">F</strong> ou 
            número <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">5</strong> do teclado alfanumérico
          </p>
        </div>

        <div className="mb-6 p-4 bg-white/5 border-l-4 border-cyan-400 rounded-lg transition-all duration-300 hover:bg-white/10 hover:translate-x-2 hover:shadow-lg hover:shadow-cyan-400/20">
          <h3 className="text-orange-400 text-xl mb-2 font-semibold">
            ⚔️ Combate
          </h3>
          <p className="leading-relaxed">
            Desvie dos disparos inimigos e derrote as naves inimigas
          </p>
        </div>

        <div className="mb-6 p-4 bg-white/5 border-l-4 border-cyan-400 rounded-lg transition-all duration-300 hover:bg-white/10 hover:translate-x-2 hover:shadow-lg hover:shadow-cyan-400/20">
          <h3 className="text-orange-400 text-xl mb-2 font-semibold">
            👾 Chefe
          </h3>
          <p className="leading-relaxed">
            Após derrotar inimigos suficientes, um chefe desafiará você
          </p>
        </div>

        <div className="mb-6 p-4 bg-white/5 border-l-4 border-cyan-400 rounded-lg transition-all duration-300 hover:bg-white/10 hover:translate-x-2 hover:shadow-lg hover:shadow-cyan-400/20">
          <h3 className="text-orange-400 text-xl mb-2 font-semibold">
            🏆 Objetivo
          </h3>
          <p className="leading-relaxed">
            Alcance a maior pontuação que conseguir
          </p>
        </div>
      </div>
    )
  }
}