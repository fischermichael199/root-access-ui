export type StoryletId = string
export type NpcId = 'lena' | string
export type ItemId = string
export type DataId = string
export type SkillId = string
export type StatusId = 'stunned' | 'shielded' | 'exposed' | string
export type Id = string

export type Condition =
  | { kind: 'flag'; key: string; value: boolean | number }
  | { kind: 'integrity'; op: '<' | '>' | '<=' | '>='; value: number }
  | { kind: 'relationship'; npc: NpcId; op: '<' | '>' | '<=' | '>='; value: number }
  | { kind: 'seenStorylet'; id: StoryletId }
  | { kind: 'notSeenStorylet'; id: StoryletId }
  | { kind: 'hasItem'; id: ItemId }
  | { kind: 'level'; op: '<' | '>' | '<=' | '>='; value: number }

export type Effect =
  | { kind: 'setFlag';key: string; value: boolean | number }
  | { kind: 'changeIntegrity'; delta: number }
  | { kind: 'changeRelationship'; npc: NpcId; delta: number }
  | { kind: 'giveItem'; id: ItemId }
  | { kind: 'removeItem'; id: ItemId }
  | { kind: 'grantXp'; amount: number }
  | { kind: 'deleteData'; id: DataId }

export interface Choice {
  label: string
  requires?: Condition[]
  effects: Effect[]
  goto?: StoryletId
}

export interface Storylet {
  id: StoryletId
  requires: Condition[]
  text: string
  choices: Choice[]
  onceOnly?: boolean
}

export type CombatActionKind = 'refactor' | 'debug' | 'deploy' | 'rollback'

export interface CombatAction {
  kind: CombatActionKind
  actorId: Id
  targetId?: Id
}

export type CombatEvent =
  | { kind: 'damage'; target: Id; amount: number }
  | { kind: 'heal'; target: Id; amount: number }
  | { kind: 'focus'; actorId: Id; delta: number }
  | { kind: 'status'; target: Id; status: StatusId }
  | { kind: 'reveal'; target: Id; weakness: string }
  | { kind: 'defeat'; target: Id }
  | { kind: 'message'; text: string }

export interface Player {
  name: string
  level: number
  xp: number
  hp: number
  maxHp: number
  focus: number
  maxFocus: number
  skills: SkillId[]
}

export interface Enemy {
  id: Id
  name: string
  hp: number
  maxHp: number
  weakness?: string
  statusEffects: StatusId[]
}

export interface CombatState {
  active: boolean
  enemies: Enemy[]
  playerStatusEffects: StatusId[]
  log: CombatEvent[]
  lastPlayerAction?: CombatAction
  turn: number
}

export interface GameState {
  version: number
  player: Player
  integrity: number
  flags: Record<string, boolean | number>
  relationships: Record<NpcId, number>
  deletedData: DataId[]
  seenStorylets: StoryletId[]
  inventory: ItemId[]
  combat: CombatState | null
  currentStoryletId: StoryletId | null
}
