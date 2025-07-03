/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Component } from 'react'
import imagemPlayer from '../assets/images/player/player-frame-1.png'
import imagemDisparo from '../assets/images/effects/player-fire.png'
import imagemInimigo from '../assets/images/enemy/enemy-C-frame-1.png'
import imagemBoss from '../assets/images/enemy/boss-C-frame-1.png'

type Props = {
  onNavigate?: (route: string) => void;
}

type State = {}

export default class Instructions extends Component<Props, State> {
  state = {}

  render() {
    return (
      <div>
        <h2 className="text-center text-cyan-400 text-3xl mb-8 font-bold tracking-widest cursor-default">
          Como Jogar - Cosmic Wings
        </h2>

        <div className="mb-6 p-4 bg-white/5 border-l-4 border-cyan-400 rounded-lg transition-all duration-300 hover:bg-white/10 hover:translate-x-2 hover:shadow-lg hover:shadow-cyan-400/20 cursor-default">
          <div className="flex items-center mb-4 gap-5">
            <img src={ imagemPlayer } alt="Imagem da nave do jogador" className='w-10 h-10'/>
            <h3 className="text-orange-400 text-xl font-semibold">
              Movimentação
            </h3>
          </div>
          <p className="leading-relaxed">
            Utilize as teclas{" "}
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              W
            </strong>
            ,{" "}
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              A
            </strong>
            ,{" "}
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              S
            </strong>
            ,{" "}
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              D
            </strong>{" "}
            ou as setas de direção do teclado (
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              ←
            </strong>
            ,{" "}
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              ↑
            </strong>
            ,{" "}
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              ↓
            </strong>
            ,{" "}
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              →
            </strong>
            ) para movimentar a nave
          </p>
        </div>

        <div className="mb-6 p-4 bg-white/5 border-l-4 border-cyan-400 rounded-lg transition-all duration-300 hover:bg-white/10 hover:translate-x-2 hover:shadow-lg hover:shadow-cyan-400/20 cursor-default">
          <div className="flex items-center mb-4 gap-5">
            <img src={ imagemDisparo } alt="Imagem do disparo do jogador" className='w-4 h-10'/>
            <h3 className="text-orange-400 text-xl font-semibold">
              Disparos
            </h3>
            </div>
          <p className="leading-relaxed">
            Atire com a{" "}
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              barra de espaço
            </strong>
            , tecla{" "}
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              F
            </strong>{" "}
            ou número{" "}
            <strong className="text-green-400 px-1 py-0.5 bg-green-400/10 rounded">
              5
            </strong>{" "}
            do teclado alfanumérico
          </p>
        </div>

        <div className="mb-6 p-4 bg-white/5 border-l-4 border-cyan-400 rounded-lg transition-all duration-300 hover:bg-white/10 hover:translate-x-2 hover:shadow-lg hover:shadow-cyan-400/20 cursor-default">
          <div className="flex items-center mb-4 gap-5">
            <img src={ imagemInimigo } alt="Imagem de uma nave inimiga" className='w-10 h-10'/>
            <h3 className="text-orange-400 text-xl font-semibold">
              Inimigos
            </h3>
          </div>
          <p className="leading-relaxed">
            Desvie dos disparos inimigos e derrote as naves inimigas
          </p>
        </div>

        <div className="mb-6 p-4 bg-white/5 border-l-4 border-cyan-400 rounded-lg transition-all duration-300 hover:bg-white/10 hover:translate-x-2 hover:shadow-lg hover:shadow-cyan-400/20 cursor-default">
          <div className="flex items-center mb-4 gap-5">
            <img src={ imagemBoss } alt="Imagem de um chefe inimigo" className='w-10 h-10'/>
            <h3 className="text-orange-400 text-xl font-semibold">
              Chefes
            </h3>
          </div>
          <p className="leading-relaxed">
            Após derrotar inimigos suficientes, um chefe desafiará você
          </p>
        </div>

        <div className="mb-6 p-4 bg-white/5 border-l-4 border-cyan-400 rounded-lg transition-all duration-300 hover:bg-white/10 hover:translate-x-2 hover:shadow-lg hover:shadow-cyan-400/20 cursor-default">
          <div className="flex items-center mb-4 gap-5">
            <img src={ imagemPlayer } alt="Imagem da nave do jogador" className='w-10 h-10'/>
            <h3 className="text-orange-400 text-xl font-semibold">
              Pontuação
            </h3>
          </div>
          <p className="leading-relaxed">
            Alcance a maior pontuação que conseguir
          </p>
        </div>

        {/* Botão de voltar se onNavigate foi fornecido */}
        {this.props.onNavigate && (
          <div className="text-center mt-6">
            <button
              onClick={() => this.props.onNavigate!("/menu")}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 border-2 border-cyan-400 rounded-lg text-white font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-400/20 cursor-pointer"
            >
              ← VOLTAR AO MENU
            </button>
          </div>
        )}
      </div>
    );
  }
}