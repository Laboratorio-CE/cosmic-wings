import React, { Component } from 'react'
import Background from './Background'
import OptionsToggle from './OptionsToggle'

// Tipagem das Props - Layout pode receber children e starCount opcional
type Props = {
  children: React.ReactNode;
  starCount?: number;
}

// Layout não precisa de state interno
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type State = {}

export default class Layout extends Component<Props, State> {
  state = {}

  render() {
    const { children, starCount = 1000 } = this.props;
    
    return (
      <div className="cosmic-gradient text-cyan-50 h-screen w-screen flex flex-col justify-center relative overflow-hidden">
        {/* Background com estrelas */}
        <Background starCount={starCount} />
        
        {/* Controles de opções */}
        <OptionsToggle />
        
        {/* Conteúdo principal passado como children */}
        <div className="relative z-10 w-full h-full flex flex-col">
          {children}
        </div>
      </div>
    )
  }
}