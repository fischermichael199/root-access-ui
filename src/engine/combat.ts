import type { GameState, CombatAction, CombatEvent, Enemy } from '../types'

const FOCUS_COST: Record<string, number> = { refactor: 10, debug: 15, deploy: 25, rollback: 5 }

function enemyTurn(enemies: Enemy[]): { events: CombatEvent[]; damageTaken: number } {
  const events: CombatEvent[] = []
  let damageTaken = 0
  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue
    const dmg = Math.round(8 + (enemy.hp / enemy.maxHp) * 6)
    damageTaken += dmg
    events.push({ kind: 'damage', target: 'player', amount: dmg })
    events.push({ kind: 'message', text: `${enemy.name} lashes out for ${dmg} damage.` })
  }
  return { events, damageTaken }
}

export function resolveAction(
  state: GameState,
  action: CombatAction,
): { next: GameState; events: CombatEvent[] } {
  if (!state.combat) throw new Error('resolveAction called outside combat')
  const events: CombatEvent[] = []
  let next = { ...state, combat: { ...state.combat } }
  const cost = FOCUS_COST[action.kind] ?? 10

  if (next.player.focus < cost) {
    return { next, events: [{ kind: 'message', text: 'Not enough Focus.' }] }
  }

  next = { ...next, player: { ...next.player, focus: next.player.focus - cost } }
  events.push({ kind: 'focus', actorId: 'player', delta: -cost })

  const target = next.combat!.enemies.find(e => e.id === action.targetId && e.hp > 0)

  switch (action.kind) {
    case 'refactor': {
      const heal = 20
      next = { ...next, player: { ...next.player, hp: Math.min(next.player.maxHp, next.player.hp + heal) } }
      events.push({ kind: 'heal', target: 'player', amount: heal })
      events.push({ kind: 'message', text: `Refactor: restored ${heal} HP.` })
      break
    }
    case 'debug': {
      if (target) {
        const w = target.weakness ?? 'none'
        next = { ...next, combat: { ...next.combat!, enemies: next.combat!.enemies.map(e => e.id === target.id ? { ...e, weakness: w } : e) } }
        events.push({ kind: 'reveal', target: target.id, weakness: w })
        events.push({ kind: 'message', text: `Debug: ${target.name} weakness = ${w}.` })
      }
      break
    }
    case 'deploy': {
      if (target) {
        const exposed = target.statusEffects.includes('exposed')
        const dmg = exposed ? 45 : 30
        const updated = next.combat!.enemies.map(e => e.id === target.id ? { ...e, hp: Math.max(0, e.hp - dmg) } : e)
        next = { ...next, combat: { ...next.combat!, enemies: updated } }
        events.push({ kind: 'damage', target: target.id, amount: dmg })
        events.push({ kind: 'message', text: `Deploy: ${dmg} damage to ${target.name}${exposed ? ' (bonus!)' : ''}.` })
        if (updated.find(e => e.id === target.id && e.hp <= 0)) {
          events.push({ kind: 'defeat', target: target.id })
        }
      }
      break
    }
    case 'rollback': {
      const last = next.combat!.lastPlayerAction
      if (last && last.kind !== 'rollback') {
        const refund = FOCUS_COST[last.kind] ?? 10
        next = { ...next, player: { ...next.player, focus: Math.min(next.player.maxFocus, next.player.focus + refund) } }
        events.push({ kind: 'focus', actorId: 'player', delta: refund })
        events.push({ kind: 'message', text: `Rollback: Focus refunded.` })
      } else {
        events.push({ kind: 'message', text: `Nothing to roll back.` })
      }
      break
    }
  }

  next = { ...next, combat: { ...next.combat!, lastPlayerAction: action } }

  if (next.combat!.enemies.every(e => e.hp <= 0)) {
    next = { ...next, combat: { ...next.combat!, active: false } }
    events.push({ kind: 'message', text: 'All threats neutralized.' })
    return { next, events }
  }

  const { events: eEvents, damageTaken } = enemyTurn(next.combat!.enemies)
  events.push(...eEvents)
  next = {
    ...next,
    player: { ...next.player, hp: Math.max(0, next.player.hp - damageTaken) },
    combat: { ...next.combat!, turn: next.combat!.turn + 1 },
  }
  if (next.player.hp <= 0) {
    next = { ...next, combat: { ...next.combat!, active: false } }
    events.push({ kind: 'defeat', target: 'player' })
  }
  return { next, events }
}
