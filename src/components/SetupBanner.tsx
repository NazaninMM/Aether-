'use client'
import { isConfigured } from '@/lib/supabase'

export default function SetupBanner() {
  if (isConfigured) return null
  return (
    <div style={{
      background: 'rgba(201,168,76,0.12)', borderBottom: '1px solid var(--gold-dim)',
      padding: '10px 28px', fontSize: 12, color: 'var(--gold)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span>⚠</span>
      <span>
        Supabase is not connected. Open <code style={{ background: 'var(--surface-2)', padding: '1px 5px', borderRadius: 4 }}>goal-planner/.env.local</code>,
        add your <strong>NEXT_PUBLIC_SUPABASE_URL</strong> and <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong>,
        then restart the dev server. Run the SQL in <code style={{ background: 'var(--surface-2)', padding: '1px 5px', borderRadius: 4 }}>supabase-schema.sql</code> first.
      </span>
    </div>
  )
}
