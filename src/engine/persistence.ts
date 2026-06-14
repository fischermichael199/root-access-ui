import type { GameState } from '../types'
import { migrate, CURRENT_VERSION } from './migrations'

const DB_NAME = 'root-access'
const STORE_NAME = 'saves'
const SAVE_KEY = 'slot-1'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveGame(state: GameState): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(state, SAVE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadGame(): Promise<GameState | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(SAVE_KEY)
    req.onsuccess = () => {
      const raw = req.result as GameState | undefined
      if (!raw) { resolve(null); return }
      try { resolve(migrate(raw)) } catch (e) { reject(e) }
    }
    req.onerror = () => reject(req.error)
  })
}

export function exportSave(state: GameState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `root-access-save-v${state.version}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importSave(onLoad: (state: GameState) => void): void {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try { onLoad(migrate(JSON.parse(e.target!.result as string) as GameState)) }
      catch { alert('Invalid save file.') }
    }
    reader.readAsText(file)
  }
  input.click()
}

export function makeNewGame(playerName: string): GameState {
  return {
    version: CURRENT_VERSION,
    player: { name: playerName, level: 1, xp: 0, hp: 100, maxHp: 100, focus: 60, maxFocus: 60, skills: [] },
    integrity: 78,
    flags: {},
    relationships: { lena: 0 },
    deletedData: [],
    seenStorylets: [],
    inventory: [],
    combat: null,
    currentStoryletId: 'intro',
  }
}
