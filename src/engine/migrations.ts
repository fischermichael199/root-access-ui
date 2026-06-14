import type { GameState } from '../types'

type MigrationFn = (state: GameState) => GameState
const MIGRATIONS: Record<number, MigrationFn> = {}
export const CURRENT_VERSION = 1

export function migrate(state: GameState): GameState {
  let s = state
  while (s.version < CURRENT_VERSION) {
    const fn = MIGRATIONS[s.version]
    if (!fn) throw new Error(`No migration from version ${s.version}`)
    s = { ...fn(s), version: s.version + 1 }
  }
  return s
}
