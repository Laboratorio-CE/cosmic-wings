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
  }
  
  setupInputEvents() {
    // Eventos do controle analógico - agora na metade esquerda da tela
    this.scene.input.on('pointerdown', this.handleInputDown, this);
    this.scene.input.on('pointermove', this.handleAnalogMove, this);
    this.scene.input.on('pointerup', this.handleInputEnd, this);
    this.scene.input.on('pointerout', this.handleInputEnd, this);
    
    // Eventos do botão de ação
    this.actionButton.on('pointerdown', this.handleActionStart, this);
    this.actionButton.on('pointerup', this.handleActionEnd, this);
    this.actionButton.on('pointerout', this.handleActionEnd, this);
  }
  
  handleInputDown(pointer: Phaser.Input.Pointer) {
    // Ativar o analógico se o toque for na metade esquerda da tela
    // Removida a verificação de pointerId === -1 para permitir reativação
    if (pointer.x < this.scene.cameras.main.width / 2) {
      this.pointerId = pointer.id;
      this.isAnalogActive = true;
      
      // Atualizar posição do thumb para onde o usuário tocou
      this.thumbX = pointer.x;
      this.thumbY = pointer.y;
      this.updateThumbPosition();
      
      // Iniciar cálculo de direção imediatamente
      this.handleAnalogMove(pointer);
    }
  }
  
  handleAnalogMove(pointer: Phaser.Input.Pointer) {
    // Verificar se este é o mesmo ponteiro que iniciou o toque no analógico
    if (!this.isAnalogActive || pointer.id !== this.pointerId) return;
    
    // Calcular distância do centro do analógico
    const dx = pointer.x - this.analogCenterX;
    const dy = pointer.y - this.analogCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Limitar o thumb ao círculo do analógico
    if (distance > this.maxDistance) {
      const angle = Math.atan2(dy, dx);
      this.thumbX = this.analogCenterX + Math.cos(angle) * this.maxDistance;
      this.thumbY = this.analogCenterY + Math.sin(angle) * this.maxDistance;
    } else {
      this.thumbX = pointer.x;
      this.thumbY = pointer.y;
    }
    
    // Atualizar posição do thumb
    this.updateThumbPosition();
    
    // Calcular direção com base na posição do thumb
    const deltaX = this.thumbX - this.analogCenterX;
    const deltaY = this.thumbY - this.analogCenterY;
    
    // Determinar direções ativas com base no threshold
    const newDirections = {
      up: deltaY < -this.threshold,
      down: deltaY > this.threshold,
      left: deltaX < -this.threshold,
      right: deltaX > this.threshold
    };
    
    // Atualizar direções na cena do jogo se mudaram
    this.updateDirections(newDirections);
  }
  
  handleInputEnd(pointer: Phaser.Input.Pointer) {
    // Verificar qual controle este ponteiro estava controlando
    if (pointer.id === this.pointerId) {
      this.handleAnalogEnd();
    }
    if (pointer.id === this.actionPointerId) {
      this.handleActionEnd();
    }
  }
  
  handleAnalogEnd() {
    if (!this.isAnalogActive) return;
    
    this.isAnalogActive = false;
    this.pointerId = -1;
    
    // Resetar posição do thumb
    this.thumbX = this.analogCenterX;
    this.thumbY = this.analogCenterY;
    this.updateThumbPosition();
    
    // Resetar todas as direções
    const resetDirections = {
      up: false,
      down: false,
      left: false,
      right: false
    };
    this.updateDirections(resetDirections);
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
    const gameScene = this.scene as any;
    
    // Para cada direção, verificar se o estado mudou
    Object.keys(newDirections).forEach(dir => {
      const typedDir = dir as 'up' | 'down' | 'left' | 'right';
      if (this.directions[typedDir] !== newDirections[typedDir]) {
        // Atualizar a direção na cena do jogo
        gameScene.setMobileControl(typedDir, newDirections[typedDir]);
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
    const gameScene = this.scene as any;
    gameScene.setMobileAction(true);
    
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
    const gameScene = this.scene as any;
    gameScene.setMobileAction(false);
    
    // Evitar propagação do evento para não interferir com o analógico
    if (pointer && pointer.event) pointer.event.stopPropagation();
  }
  
  // Método para destruir os controles virtuais
  destroy() {
    if (this.analogBase) this.analogBase.destroy();
    if (this.analogThumb) this.analogThumb.destroy();
    if (this.actionButton) this.actionButton.destroy();
    if (this.actionButtonIcon) this.actionButtonIcon.destroy();
    
    // Remover event listeners
    this.scene.input.off('pointerdown', this.handleInputDown, this);
    this.scene.input.off('pointermove', this.handleAnalogMove, this);
    this.scene.input.off('pointerup', this.handleInputEnd, this);
    this.scene.input.off('pointerout', this.handleInputEnd, this);
  }
  
  // Método para atualizar posições dos controles se o tamanho da tela mudar
  updatePositions() {
    if (window.innerWidth > 768) {
      this.destroy();
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
    this.analogBase.clear();
    this.analogBase.fillStyle(0x22D3EE, 0.1);
    this.analogBase.lineStyle(2, 0x22D3EE, 0.3);
    this.analogBase.fillCircle(this.analogCenterX, this.analogCenterY, 40);
    this.analogBase.strokeCircle(this.analogCenterX, this.analogCenterY, 40);
    
    // Atualizar área interativa
    this.analogBase.input.hitArea = new Phaser.Geom.Circle(this.analogCenterX, this.analogCenterY, 40);
    
    // Redesenhar thumb
    this.updateThumbPosition();
    
    // Atualizar posição do botão de ação
    const actionX = width - 80;
    const actionY = height - 80;
    
    // Redesenhar botão de ação
    this.actionButton.clear();
    this.actionButton.fillStyle(0xEF4444, 0.2);
    this.actionButton.lineStyle(2, 0xEF4444, 1);
    this.actionButton.fillCircle(actionX, actionY, 24);
    this.actionButton.strokeCircle(actionX, actionY, 24);
    
    // Atualizar área interativa
    this.actionButton.input.hitArea = new Phaser.Geom.Circle(actionX, actionY, 24);
    
    // Redesenhar ícone do botão
    this.actionButtonIcon.clear();
    this.actionButtonIcon.fillStyle(0xEF4444, 1);
    this.actionButtonIcon.fillCircle(actionX, actionY, 9);
  }
}