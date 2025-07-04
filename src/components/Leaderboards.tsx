/* eslint-disable @typescript-eslint/no-empty-object-type */
import React, { Component } from "react";
import imagemPlayer from "../assets/images/player/player-frame-1.png";

type Props = {
  onNavigate?: (route: string) => void;
}

type State = {
  isPressed: boolean;
};

export default class Leaderboards extends Component<Props, State> {
  state: State = {
    isPressed: true,
  };
  componentDidMount() {
    if (this.props.onNavigate) {
      document.addEventListener("keydown", this.handleKeyDown);
    }
  }

  componentWillUnmount() {
    if (this.props.onNavigate) {
      document.removeEventListener("keydown", this.handleKeyDown);
    }
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (!this.props.onNavigate) return;

    switch (event.key) {
      case "Enter":
      case "f":
      case "F":
      case "5":
      case " ":
      case "Escape":
        event.preventDefault();
        this.animatePress();
        break;
      default:
        break;
    }
  };

  animatePress = () => {
    this.setState({ isPressed: false });

    setTimeout(() => {
      this.setState({ isPressed: true });
      this.props.onNavigate!("/menu");
    }, 150);
  };

  render() {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-black/80 to-blue-900/90 border-2 border-cyan-400 rounded-2xl text-white font-mono shadow-2xl shadow-cyan-400/20">
        <h2 className="text-center text-cyan-400 text-3xl mb-8 font-bold tracking-widest">
        LEADERBOARDS
        </h2>

        <div className="space-y-4 mb-8">
          <div className="text-center text-gray-300">
            <p className="text-lg">Ranking em desenvolvimento...</p>
            <p className="text-sm mt-2">
              Em breve você poderá ver os melhores jogadores!
            </p>
          </div>
        </div>

        {this.props.onNavigate && (
          <div className="text-center mt-6">
            <button
              onClick={() => this.animatePress()}
              className={`
                relative flex items-center justify-center w-56 p-2 font-bold text-base transition-all duration-200 cursor-pointer mx-auto text-yellow-300
                ${this.state.isPressed ? "scale-105" : "scale-100"}
                active:scale-100
              `}
            >
              <img
                src={imagemPlayer}
                alt="Nave selecionada"
                className="absolute left-0 w-7 h-7 rotate-90"
              />

              <span className="text-left w-full pl-10">VOLTAR AO MENU</span>
            </button>
          </div>
        )}
      </div>
    );
  }
}