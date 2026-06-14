import type { Storylet, GameState } from '../types'
import { evaluateAll } from './conditions'

export function getQualifiedStorylets(state: GameState, storylets: Storylet[]): Storylet[] {
  return storylets.filter(s => {
    if (s.onceOnly && state.seenStorylets.includes(s.id)) return false
    return evaluateAll(state, s.requires)
  })
}

export function markSeen(state: GameState, id: string): GameState {
  if (state.seenStorylets.includes(id)) return state
  return { ...state, seenStorylets: [...state.seenStorylets, id] }
}
