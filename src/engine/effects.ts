import type { Effect, GameState } from '../types'

const XP_PER_LEVEL = 100

function checkLevelUp(state: GameState): GameState {
  const needed = state.player.level * XP_PER_LEVEL
  if (state.player.xp >= needed) {
    return {
      ...state,
      player: {
        ...state.player,
        level: state.player.level + 1,
        xp: state.player.xp - needed,
        maxHp: state.player.maxHp + 10,
        hp: Math.min(state.player.hp + 10, state.player.maxHp + 10),
        maxFocus: state.player.maxFocus + 5,
      },
    }
  }
  return state
}

export function applyEffect(state: GameState, effect: Effect): GameState {
  switch (effect.kind) {
    case 'setFlag':
      return { ...state, flags: { ...state.flags, [effect.key]: effect.value } }
    case 'changeIntegrity':
      return { ...state, integrity: Math.max(0, Math.min(100, state.integrity + effect.delta)) }
    case 'changeRelationship':
      return {
        ...state,
        relationships: {
          ...state.relationships,
          [effect.npc]: Math.max(-100, Math.min(100, (state.relationships[effect.npc] ?? 0) + effect.delta)),
        },
      }
    case 'giveItem':
      return { ...state, inventory: [...state.inventory, effect.id] }
    case 'removeItem':
      return { ...state, inventory: state.inventory.filter(i => i !== effect.id) }
    case 'grantXp':
      return checkLevelUp({ ...state, player: { ...state.player, xp: state.player.xp + effect.amount } })
    case 'deleteData':
      return {
        ...state,
        deletedData: state.deletedData.includes(effect.id) ? state.deletedData : [...state.deletedData, effect.id],
      }
  }
}

export function applyEffects(state: GameState, effects: Effect[]): GameState {
  return effects.reduce((s, e) => applyEffect(s, e), state)
}
