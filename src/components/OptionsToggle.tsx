/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Component } from 'react'
import { FaMusic } from "react-icons/fa";
import { AiFillSound } from "react-icons/ai";


type Props = {}

type State = {
  musicMuted: boolean;
  soundMuted: boolean;
}

export default class OptionsToggle extends Component<Props, State> {
  state: State = {
    musicMuted: false,
    soundMuted: false
  }

  toggleMusic = () => {
    this.setState(prevState => ({
      musicMuted: !prevState.musicMuted
    }))
  }

  toggleSound = () => {
    this.setState(prevState => ({
      soundMuted: !prevState.soundMuted
    }))
  }

  render() {
    const { musicMuted, soundMuted } = this.state

    return (
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        {/* Botão de Música */}
        <button
          onClick={this.toggleMusic}
          className="relative w-8 h-8 bg-white border-2 border-red-500 flex items-center justify-center hover:bg-gray-100 transition-colors active:scale-95"
        >
          {/* Ícone de Música */}
          <FaMusic color="black" />

          {/* Linha diagonal quando mutado */}
          {musicMuted && (
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="w-full h-0.5 bg-red-500 absolute top-1/2 left-0 transform -translate-y-1/2 -rotate-45 origin-center" style={{width: '141.42%', marginLeft: '-20.71%'}}></div>
              </div>
            </div>
          )}
        </button>

        {/* Botão de Som */}
        <button
          onClick={this.toggleSound}
          className="relative w-8 h-8 bg-white border-2 border-red-500 flex items-center justify-center hover:bg-gray-100 transition-colors active:scale-95"
        >
          {/* Ícone de Alto-falante */}
                <AiFillSound
                    color="black"
                />

          {/* Linha diagonal quando mutado */}
          {soundMuted && (
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="w-full h-0.5 bg-red-500 absolute top-1/2 left-0 transform -translate-y-1/2 -rotate-45 origin-center" style={{width: '141.42%', marginLeft: '-20.71%'}}></div>
              </div>
            </div>
          )}
        </button>
      </div>
    );
  }
}