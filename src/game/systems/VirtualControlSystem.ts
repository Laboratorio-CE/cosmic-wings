import Phaser from 'phaser';

/**
 * Sistema de controle virtual para telas de tablet ou menores
 * Implementa um analógico virtual e botão de ação diretamente no canvas do Phaser
 */
export default class VirtualControlSystem {
  scene: Phaser.Scene;
  analogBase!: Phaser.GameObjects.Graphics;
  analogThumb!: Phaser.GameObjects.Graphics;
  actionButton!: Phaser.GameObjects.Graphics;
  actionButtonIcon!: Phaser.GameObjects.Graphics;
  
  isAnalogActive: boolean = false;
  analogCenterX: number = 0;
  analogCenterY: number = 0;
  thumbX: number = 0;
  thumbY: number = 0;
  
  maxDistance: number = 32; // Mesmo valor do GameUI
  threshold: number = 15;   // Mesmo valor do GameUI
  
  isActionActive: boolean = false;
  
  // IDs dos ponteiros para suporte a multitouch
  pointerId: number = -1;        // Para o analógico
  actionPointerId: number = -1;  // Para o botão de ação
  
  // Armazena o estado atual das direções
  directions = {
    up: false,
    down: false,
    left: false,
    right: false
  };
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // Só cria os controles se a largura da tela for de tablet ou menor (768px ou menos)
    if (window.innerWidth > 768) return;
    
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;
    
    // Criar base do analógico (lado esquerdo)
    this.analogCenterX = 80;
    this.analogCenterY = height - 80;
    this.thumbX = this.analogCenterX;
    this.thumbY = this.analogCenterY;
    
    // Criar base do analógico - círculo ciano com transparência
    this.analogBase = scene.add.graphics();
    this.analogBase.fillStyle(0x22D3EE, 0.1); // cor ciano com 10% de opacidade
    this.analogBase.lineStyle(2, 0x22D3EE, 0.3); // borda ciano com 30% de opacidade
    this.analogBase.fillCircle(this.analogCenterX, this.analogCenterY, 40);
    this.analogBase.strokeCircle(this.analogCenterX, this.analogCenterY, 40);
    this.analogBase.setInteractive(
      new Phaser.Geom.Circle(this.analogCenterX, this.analogCenterY, 40),
      Phaser.Geom.Circle.Contains
    );
    
    // Criar thumb do analógico - círculo ciano
    this.analogThumb = scene.add.graphics();
    this.analogThumb.fillStyle(0x22D3EE, 0.6); // cor ciano com 60% de opacidade
    this.analogThumb.lineStyle(2, 0x22D3EE, 1); // borda ciano
    this.analogThumb.fillCircle(this.analogCenterX, this.analogCenterY, 16);
    this.analogThumb.strokeCircle(this.analogCenterX, this.analogCenterY, 16);
    
    // Criar botão de ação (lado direito)
    const actionX = width - 80;
    const actionY = height - 80;
    
    // Criar base do botão de ação - círculo vermelho com transparência
    this.actionButton = scene.add.graphics();
    this.actionButton.fillStyle(0xEF4444, 0.2); // cor vermelha com 20% de opacidade
    this.actionButton.lineStyle(2, 0xEF4444, 1); // borda vermelha
    this.actionButton.fillCircle(actionX, actionY, 24);
    this.actionButton.strokeCircle(actionX, actionY, 24);
    this.actionButton.setInteractive(
      new Phaser.Geom.Circle(actionX, actionY, 24),
      Phaser.Geom.Circle.Contains
    );
    
    // Criar ícone do botão de ação - círculo vermelho
    this.actionButtonIcon = scene.add.graphics();
    this.actionButtonIcon.fillStyle(0xEF4444, 1); // vermelho sólido
    this.actionButtonIcon.fillCircle(actionX, actionY, 9);
    
    // Definir profundidade para garantir que os controles fiquem acima de outros elementos do jogo
    this.analogBase.setDepth(100);
    this.analogThumb.setDepth(101);
    this.actionButton.setDepth(100);
    this.actionButtonIcon.setDepth(101);
    
    // Configurar eventos de entrada
    this.setupInputEvents();
    // Adiciona listeners diretos para o botão de ação
    this.actionButton.on('pointerdown', this.handleActionStart, this);
    this.actionButton.on('pointerup', this.handleActionEnd, this);
    this.actionButton.on('pointerout', this.handleActionEnd, this);
  }
  
setupInputEvents() {
  // Eventos globais para analógico (meia tela esquerda)
  this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    if (pointer.x < this.scene.cameras.main.width / 2 && this.pointerId === -1) {
      this.pointerId = pointer.id;
      this.isAnalogActive = true;
      this.thumbX = pointer.x;
      this.thumbY = pointer.y;
      this.updateThumbPosition();
    }
  });
      
  this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
    if (pointer.id === this.pointerId && this.isAnalogActive) {
      const dx = pointer.x - this.analogCenterX;
      const dy = pointer.y - this.analogCenterY;
      const dist = Math.min(Math.sqrt(dx * dx + dy * dy), this.maxDistance);
      const angle = Math.atan2(dy, dx);

      this.thumbX = this.analogCenterX + Math.cos(angle) * dist;
      this.thumbY = this.analogCenterY + Math.sin(angle) * dist;

      // Atualizar direções e posição visual
      this.updateThumbPosition();
      const newDirections = {
        up: dy < -this.threshold,
        down: dy > this.threshold,
        left: dx < -this.threshold,
        right: dx > this.threshold
      };
      this.updateDirections(newDirections);
    }
  });
  
  this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
    // Tratar liberação do analógico
    if (pointer.id === this.pointerId) {
      this.pointerId = -1;
      this.isAnalogActive = false;
      this.thumbX = this.analogCenterX;
      this.thumbY = this.analogCenterY;
      this.updateThumbPosition();
      const resetDirections = { up: false, down: false, left: false, right: false };
      this.updateDirections(resetDirections);
    }
  });
  
  // Listeners do botão de ação agora são diretos (ver construtor)
}
  
  // Novo handler: pointerdown apenas para analógico
  // Handlers globais para analógico (multitouch e metade esquerda)
  handleAnalogGlobalDown(pointer: Phaser.Input.Pointer) {
    const width = this.scene.cameras.main.width;
    // Só ativa se o toque for na metade esquerda e não estiver já ativo
    if (pointer.x < width / 2 && !this.isAnalogActive) {
      this.pointerId = pointer.id;
      this.isAnalogActive = true;
      this.thumbX = pointer.x;
      this.thumbY = pointer.y;
      this.updateThumbPosition();
      this.handleAnalogGlobalMove(pointer);
    }
  }

  handleAnalogGlobalMove(pointer: Phaser.Input.Pointer) {
    if (!this.isAnalogActive || pointer.id !== this.pointerId) return;
    // ...cálculo igual ao antigo handleAnalogMove...
    const dx = pointer.x - this.analogCenterX;
    const dy = pointer.y - this.analogCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > this.maxDistance) {
      const angle = Math.atan2(dy, dx);
      this.thumbX = this.analogCenterX + Math.cos(angle) * this.maxDistance;
      this.thumbY = this.analogCenterY + Math.sin(angle) * this.maxDistance;
    } else {
      this.thumbX = pointer.x;
      this.thumbY = pointer.y;
    }
    this.updateThumbPosition();
    const deltaX = this.thumbX - this.analogCenterX;
    const deltaY = this.thumbY - this.analogCenterY;
    const newDirections = {
      up: deltaY < -this.threshold,
      down: deltaY > this.threshold,
      left: deltaX < -this.threshold,
      right: deltaX > this.threshold
    };
    this.updateDirections(newDirections);
  }

  handleAnalogGlobalUp(pointer: Phaser.Input.Pointer) {
    // Só reseta se for o ponteiro do analógico
    if (this.isAnalogActive && pointer.id === this.pointerId) {
      this.isAnalogActive = false;
      this.pointerId = -1;
      this.thumbX = this.analogCenterX;
      this.thumbY = this.analogCenterY;
      this.updateThumbPosition();
      const resetDirections = {
        up: false,
        down: false,
        left: false,
        right: false
      };
      this.updateDirections(resetDirections);
    }
  }
  
//   handleAnalogMove(pointer: Phaser.Input.Pointer) {
//     // Não usado mais, substituído pelos handlers globais
//   }
  
//   handleInputEnd(pointer: Phaser.Input.Pointer) {
//     // Não é mais necessário, pois cada controle tem seu próprio listener
//   }
  
  handleAnalogEnd() {
    // Não usado mais, substituído pelos handlers globais
  }
  
  updateThumbPosition() {
    // Limpar e redesenhar o thumb na nova posição
    this.analogThumb.clear();
    this.analogThumb.fillStyle(this.isAnalogActive ? 0x22D3EE : 0x22D3EE, this.isAnalogActive ? 0.8 : 0.6);
    this.analogThumb.lineStyle(2, 0x22D3EE, 1);
    this.analogThumb.fillCircle(this.thumbX, this.thumbY, 16);
    this.analogThumb.strokeCircle(this.thumbX, this.thumbY, 16);
  }
  
  updateDirections(newDirections: {up: boolean, down: boolean, left: boolean, right: boolean}) {
    // Obter referência para a cena do jogo
    const gameScene = this.scene as Phaser.Scene & {
      setMobileControl?: (dir: 'up' | 'down' | 'left' | 'right', active: boolean) => void;
    };
    // Para cada direção, verificar se o estado mudou
    Object.keys(newDirections).forEach(dir => {
      const typedDir = dir as 'up' | 'down' | 'left' | 'right';
      if (this.directions[typedDir] !== newDirections[typedDir]) {
        // Atualizar a direção na cena do jogo
        if (gameScene.setMobileControl) {
          gameScene.setMobileControl(typedDir, newDirections[typedDir]);
        }
        // Atualizar nosso estado local
        this.directions[typedDir] = newDirections[typedDir];
      }
    });
  }

  handleActionStart(pointer: Phaser.Input.Pointer) {
    this.actionPointerId = pointer.id;
    this.isActionActive = true;
    // Atualizar visual do botão
    this.actionButton.clear();
    this.actionButton.fillStyle(0xEF4444, 0.4); // Mais escuro quando pressionado
    this.actionButton.lineStyle(2, 0xEF4444, 1);
    this.actionButton.fillCircle(this.scene.cameras.main.width - 80, this.scene.cameras.main.height - 80, 24);
    this.actionButton.strokeCircle(this.scene.cameras.main.width - 80, this.scene.cameras.main.height - 80, 24);
    // Acionar ação na cena do jogo
    const gameScene = this.scene as Phaser.Scene & {
      setMobileAction?: (active: boolean) => void;
    };
    if (gameScene.setMobileAction) {
      gameScene.setMobileAction(true);
    }
    // Evitar propagação do evento para não interferir com o analógico
    if (pointer.event) pointer.event.stopPropagation();
  }

  handleActionEnd(pointer?: Phaser.Input.Pointer) {
    if (!this.isActionActive) return;
    this.isActionActive = false;
    this.actionPointerId = -1;
    // Resetar visual do botão
    this.actionButton.clear();
    this.actionButton.fillStyle(0xEF4444, 0.2); // Voltar à opacidade normal
    this.actionButton.lineStyle(2, 0xEF4444, 1);
    this.actionButton.fillCircle(this.scene.cameras.main.width - 80, this.scene.cameras.main.height - 80, 24);
    this.actionButton.strokeCircle(this.scene.cameras.main.width - 80, this.scene.cameras.main.height - 80, 24);
    // Parar ação na cena do jogo
    const gameScene = this.scene as Phaser.Scene & {
      setMobileAction?: (active: boolean) => void;
    };
    if (gameScene.setMobileAction) {
      gameScene.setMobileAction(false);
    }
    // Evitar propagação do evento para não interferir com o analógico
    if (pointer && pointer.event) pointer.event.stopPropagation();
  }
  
  // Método para destruir os controles virtuais
  destroy() {
    if (this.analogBase) this.analogBase.destroy();
    if (this.analogThumb) this.analogThumb.destroy();
    if (this.actionButton) {
      this.actionButton.destroy();
      // Remover event listeners do botão de ação
      if (typeof this.actionButton.off === 'function') {
        this.actionButton.off('pointerdown', this.handleActionStart, this);
        this.actionButton.off('pointerup', this.handleActionEnd, this);
        this.actionButton.off('pointerout', this.handleActionEnd, this);
      }
    }
    if (this.actionButtonIcon) this.actionButtonIcon.destroy();
    // Remover event listeners globais do analógico
    if (this.scene && this.scene.input) {
      if (typeof this.scene.input.off === 'function') {
        this.scene.input.off('pointerdown', this.handleAnalogGlobalDown, this);
        this.scene.input.off('pointermove', this.handleAnalogGlobalMove, this);
        this.scene.input.off('pointerup', this.handleAnalogGlobalUp, this);
      }
    }
  }
  
  // Método para atualizar posições dos controles se o tamanho da tela mudar
  updatePositions() {
    if (window.innerWidth > 768) {
      this.destroy();
      return;
    }

    // Proteção extra: garantir que todos os elementos gráficos existem
    if (!this.analogBase || !this.analogThumb || !this.actionButton || !this.actionButtonIcon) {
      // Não há controles para atualizar
      return;
    }

    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Atualizar posição do analógico
    this.analogCenterX = 80;
    this.analogCenterY = height - 80;
    this.thumbX = this.analogCenterX;
    this.thumbY = this.analogCenterY;

    // Redesenhar base do analógico
    if (this.analogBase) {
      this.analogBase.clear();
      this.analogBase.fillStyle(0x22D3EE, 0.1);
      this.analogBase.lineStyle(2, 0x22D3EE, 0.3);
      this.analogBase.fillCircle(this.analogCenterX, this.analogCenterY, 40);
      this.analogBase.strokeCircle(this.analogCenterX, this.analogCenterY, 40);
      // Atualizar área interativa
      if (this.analogBase.input) {
        this.analogBase.input.hitArea = new Phaser.Geom.Circle(this.analogCenterX, this.analogCenterY, 40);
      }
    }

    // Redesenhar thumb
    if (this.analogThumb) {
      this.updateThumbPosition();
    }

    // Atualizar posição do botão de ação
    const actionX = width - 80;
    const actionY = height - 80;

    // Redesenhar botão de ação
    if (this.actionButton) {
      this.actionButton.clear();
      this.actionButton.fillStyle(0xEF4444, 0.2);
      this.actionButton.lineStyle(2, 0xEF4444, 1);
      this.actionButton.fillCircle(actionX, actionY, 24);
      this.actionButton.strokeCircle(actionX, actionY, 24);
      // Atualizar área interativa
      if (this.actionButton.input) {
        this.actionButton.input.hitArea = new Phaser.Geom.Circle(actionX, actionY, 24);
      }
    }

    // Redesenhar ícone do botão
    if (this.actionButtonIcon) {
      this.actionButtonIcon.clear();
      this.actionButtonIcon.fillStyle(0xEF4444, 1);
      this.actionButtonIcon.fillCircle(actionX, actionY, 9);
    }
  }
}