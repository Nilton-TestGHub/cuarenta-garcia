'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { ALLOWED_NAMES, AllowedName } from '@/lib/names'

export default function Lobby(){
  const [me, setMe] = useState<AllowedName>('Nilton')
  const [tables, setTables] = useState<any[]>([])
  const r = useRouter()

  useEffect(()=>{
    const n = localStorage.getItem('playerName') as AllowedName
    if (!n || !ALLOWED_NAMES.includes(n)) r.replace('/')
    else setMe(n)
  },[r])

  useEffect(()=>{
    load()
    const sub = supabase.channel('tables')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, load)
      .subscribe()
    return ()=>{ supabase.removeChannel(sub) }
  },[])

  async function load(){
    const { data } = await supabase.from('tables').select('*').order('created_at',{ ascending:false })
    setTables(data||[])
  }

  async function create(mode: 'solo'|'parejas'){
    const { data, error } = await supabase.from('tables').insert({ mode }).select().single()
    if (error) return alert(error.message)
    r.push(`/table/${data.id}`)
  }

  return (
    <main className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Hola, {me}</h1>
        <div className="flex gap-2">
          <button onClick={()=>create('solo')} className="btn bg-neutral-900 text-white">Nueva mesa 2P</button>
          <button onClick={()=>create('parejas')} className="btn bg-white border">Nueva mesa Parejas</button>
          <button onClick={()=>r.push('/standings')} className="btn bg-white border">Tabla de posiciones</button>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {tables.map(t=> (
          <div key={t.id} className="card p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold">Mesa {t.id.slice(0,6)} • {t.mode==='solo'?'2 Jugadores':'Parejas'}</div>
              <div className="text-sm opacity-70">Estado: {t.status}</div>
            </div>
            <button onClick={()=>r.push(`/table/${t.id}`)} className="btn bg-neutral-900 text-white">Entrar</button>
          </div>
        ))}
      </div>
    </main>
  )
}
