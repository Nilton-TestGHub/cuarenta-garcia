'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ADMIN_NAME, ALLOWED_NAMES, AllowedName } from '@/lib/names'

export default function Standings(){
  const [me, setMe] = useState<AllowedName>('Nilton')
  const [season, setSeason] = useState<any | null>(null)
  const [individual, setIndividual] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])

  useEffect(()=>{
    const n = localStorage.getItem('playerName') as AllowedName
    if (n && ALLOWED_NAMES.includes(n)) setMe(n)
  },[])

  useEffect(()=>{ load() },[])

  async function load(){
    const cur = await supabase.from('seasons').select('*').eq('is_current', true).single()
    setSeason(cur.data)
    const ind = await supabase.from('standings_individual_view').select('*')
    setIndividual(ind.data||[])
    const par = await supabase.from('standings_partners_view').select('*')
    setPartners(par.data||[])
  }

  async function endSeason(){
    if (me!==ADMIN_NAME) return alert('Solo el admin puede cerrar la temporada')
    const res = await fetch('/api/juez', { method:'POST', body: JSON.stringify({ action:'end-season' }) })
    if (!res.ok) alert(await res.text())
    else load()
  }

  return (
    <main className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Temporada actual: {season?.seq}</h1>
        {me===ADMIN_NAME && <button onClick={endSeason} className="btn bg-neutral-900 text-white">Finalizar temporada</button>}
      </div>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Tabla Individual</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {individual.map((row,i)=> (
            <div key={i} className="card p-3 flex items-center justify-between">
              <div className="font-medium">{row.player_name}</div>
              <div className="text-sm opacity-70">PJ {row.games_counted} • {row.wins}-{row.losses} • Dif {row.points_diff}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Tabla Parejas</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {partners.map((row,i)=> (
            <div key={i} className="card p-3 flex items-center justify-between">
              <div className="font-medium">{row.player_a} &amp; {row.player_b}</div>
              <div className="text-sm opacity-70">PJ {row.games_counted} • {row.wins}-{row.losses} • Dif {row.points_diff}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
