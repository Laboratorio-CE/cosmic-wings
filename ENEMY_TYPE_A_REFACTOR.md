# EnemyTypeA - Documentação

## Visão Geral
A classe `EnemyTypeA` foi refatorada para herdar corretamente de `AbstractEntity`, proporcionando uma base sólida e reutilizável para entidades do jogo.

## Principais Melhorias

### 1. Herança Correta
- Agora herda de `AbstractEntity` em vez da implementação inline do GameCanvas
- Utiliza todos os sistemas otimizados: timers, animação, movimento, etc.

### 2. Sistema de Estados
- Estados bem definidos: `entering`, `moving_to_position`, `shooting`, `moving_to_next`, `leaving`
- Máquina de estados limpa e fácil de debugar

### 3. Sistema de Disparo Otimizado
- Usa sistema de timers do `AbstractEntity` (`setTimer`, `isTimerExpired`)
- Controle de rajadas e tiros individuais
- Som integrado

### 4. Movimento Inteligente
- Usa `moveTowards` do `AbstractEntity` para movimento suave
- Animação baseada na direção do movimento
- Detecção automática de saída da tela

## Uso no GameCanvas

```typescript
// No GameCanvas, agora você pode usar:
import EnemyTypeA from "../game/entities/EnemyTypeA";

// Criar inimigo
const enemy = new EnemyTypeA(this, x, y);

// Ajustar para onda
enemy.adjustForWave(currentWave);

// Atualizar (chamado automaticamente no loop do jogo)
enemy.update(); // Chama tick() internamente
```

## Compatibilidade
A nova implementação mantém compatibilidade com o código existente:
- Propriedade `sprite` acessível
- Método `update()` público
- Estado acessível via `currentState`
- Mesmo comportamento de disparo e movimento

## Integração com GameCanvas
A classe está preparada para integração com sistemas do GameCanvas:
- Sistema de reserva de posições
- Sistema de projéteis
- Sistema de pontuação
- Sistema de sons

## Próximos Passos
1. Remover implementação inline do GameCanvas ✅
2. Criar classes similares para EnemyTypeB e EnemyTypeC
3. Refatorar Boss para usar AbstractEntity
4. Integrar completamente com sistemas existentes

## Estrutura do Arquivo
```
src/game/entities/
├── AbstractEntity.ts     # Classe base
├── EnemyTypeA.ts        # Inimigo Tipo A (refatorado)
├── Enemy.ts             # Inimigo básico
├── Player.ts            # Jogador
└── Boss.ts              # Boss
```

## Benefícios da Refatoração
- ✅ Código mais limpo e organizad
- ✅ Reutilização de funcionalidades comuns
- ✅ Fácil manutenção e extensão
- ✅ Melhor separação de responsabilidades
- ✅ Sistema de timers mais robusto
- ✅ Animações consistentes
- ✅ Detecção de limites automática
