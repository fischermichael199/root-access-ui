import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'

export default function App() {
  const { state, newGame, loadFromDb } = useGameStore()

  useEffect(() => { loadFromDb() }, [loadFromDb])

  if (!state) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ textAlign: 'center', maxWidth: 360, padding: '0 24px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-accent)', letterSpacing: '-0.05em', marginBottom: '0.5rem' }}>
            ROOT ACCESS
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
            A neural-dive into the system you helped build.
          </p>
          <button
            onClick={() => newGame('Kade')}
            style={{
              width: '100%', padding: '12px 24px',
              border: '1px solid var(--color-accent)',
              color: 'var(--color-accent)', background: 'transparent',
              fontSize: '0.75rem', fontFamily: 'inherit',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseOver={e => { const b = e.currentTarget; b.style.background = 'var(--color-accent)'; b.style.color = 'var(--color-bg)' }}
            onMouseOut={e => { const b = e.currentTarget; b.style.background = 'transparent'; b.style.color = 'var(--color-accent)' }}
          >
            INITIATE NEURAL DIVE
          </button>
        </div>
      </div>
    )
  }

  const { player, integrity } = state

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 24px', borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)', fontSize: '0.75rem',
      }}>
        <span style={{ color: 'var(--color-accent)' }}>ROOT ACCESS // THE STACK</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <span>
            <span style={{ color: 'var(--color-muted)' }}>HP </span>
            <span style={{ color: player.hp < 30 ? 'var(--color-danger)' : 'var(--color-success)' }}>
              {player.hp}/{player.maxHp}
            </span>
          </span>
          <span>
            <span style={{ color: 'var(--color-muted)' }}>FOCUS </span>
            <span style={{ color: 'var(--color-accent)' }}>{player.focus}/{player.maxFocus}</span>
          </span>
          <span>
            <span style={{ color: 'var(--color-muted)' }}>INTEGRITY </span>
            <span style={{ color: integrity < 30 ? 'var(--color-danger)' : integrity < 60 ? 'var(--color-warn)' : 'var(--color-success)' }}>
              {integrity}%
            </span>
          </span>
          <span style={{ color: 'var(--color-muted)' }}>{player.name} LV{player.level}</span>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.8rem' }}>
          <div style={{ color: 'var(--color-accent)', marginBottom: '1rem', fontSize: '1rem' }}>
            // PRESENTATION LAYER — SECTOR 01
          </div>
          <p>The environment boots. Somewhere ahead, Lena is waiting.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--color-border)' }}>
            [QBN engine ready — story content is next]
          </p>
        </div>
      </main>
    </div>
  )
}
