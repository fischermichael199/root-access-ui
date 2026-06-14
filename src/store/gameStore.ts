import { create } from 'zustand'
import type { GameState, CombatAction, CombatEvent, Storylet, StoryletId } from '../types'
import { resolveAction } from '../engine/combat'
import { applyEffects } from '../engine/effects'
import { markSeen } from '../engine/storylets'
import { saveGame, loadGame, exportSave, importSave, makeNewGame } from '../engine/persistence'

interface GameStore {
  state: GameState | null
  pendingEvents: CombatEvent[]
  newGame: (playerName: string) => void
  loadFromDb: () => Promise<void>
  save: () => Promise<void>
  doExport: () => void
  doImport: () => void
  enterStorylet: (id: StoryletId) => void
  makeChoice: (choiceIndex: number, storylets: Storylet[]) => void
  submitCombatAction: (action: CombatAction) => void
  clearEvents: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: null,
  pendingEvents: [],

  newGame: (playerName) => {
    const s = makeNewGame(playerName)
    set({ state: s })
    saveGame(s)
  },

  loadFromDb: async () => {
    const s = await loadGame()
    if (s) set({ state: s })
  },

  save: async () => {
    const { state } = get()
    if (state) await saveGame(state)
  },

  doExport: () => { const { state } = get(); if (state) exportSave(state) },

  doImport: () => { importSave((s) => set({ state: s })) },

  enterStorylet: (id) => {
    const { state } = get()
    if (!state) return
    set({ state: { ...markSeen(state, id), currentStoryletId: id } })
  },

  makeChoice: (idx, storylets) => {
    const { state } = get()
    if (!state?.currentStoryletId) return
    const storylet = storylets.find(s => s.id === state.currentStoryletId)
    const choice = storylet?.choices[idx]
    if (!choice) return
    let next = applyEffects(state, choice.effects)
    next = choice.goto
      ? { ...markSeen(next, choice.goto), currentStoryletId: choice.goto }
      : { ...next, currentStoryletId: null }
    set({ state: next })
    saveGame(next)
  },

  submitCombatAction: (action) => {
    const { state } = get()
    if (!state?.combat?.active) return
    const { next, events } = resolveAction(state, action)
    set({ state: next, pendingEvents: events })
    saveGame(next)
  },

  clearEvents: () => set({ pendingEvents: [] }),
}))
