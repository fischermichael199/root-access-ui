import type { Condition, GameState } from '../types'

function compare(a: number, op: string, b: number): boolean {
  switch (op) {
    case '<':  return a < b
    case '>':  return a > b
    case '<=': return a <= b
    case '>=': return a >= b
    default:   return false
  }
}

export function evaluateCondition(state: GameState, cond: Condition): boolean {
  switch (cond.kind) {
    case 'flag':           return state.flags[cond.key] === cond.value
    case 'integrity':      return compare(state.integrity, cond.op, cond.value)
    case 'relationship':   return compare(state.relationships[cond.npc] ?? 0, cond.op, cond.value)
    case 'seenStorylet':   return state.seenStorylets.includes(cond.id)
    case 'notSeenStorylet':return !state.seenStorylets.includes(cond.id)
    case 'hasItem':        return state.inventory.includes(cond.id)
    case 'level':          return compare(state.player.level, cond.op, cond.value)
  }
}

export function evaluateAll(state: GameState, conditions: Condition[]): boolean {
  return conditions.every(c => evaluateCondition(state, c))
}
