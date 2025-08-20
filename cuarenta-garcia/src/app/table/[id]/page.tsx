'use client'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import CardFace from '@/components/CardFace'
import ScoreStrip from '@/components/ScoreStrip'
import { AllowedName, ALLOWED_NAMES } from '@/lib/names'
import type { Card } from '@/lib/rules'

export default function TablePage(){
  const { id } = useParams<{id:string}>()
  const r = useRouter()
  const [me, setMe] = useState<AllowedName>('Nilton')
  const [state, setState] = useState<any | null>(null)

  useEffect(()=>{
    const n = localStorage.getItem('playerName') as AllowedName
    if (!n || !ALLOWED_NAMES.includes(n)) r.replace('/')
    else setMe(n)
  },[r])

  useEffect(()=>{
    async function ensure(){
      await supabase.from('table_players').upsert({ table_id:id, player_name: me }).select()
    }
    if (id && me) ensure()
  },[id, me])

  useEffect(() => {
    if (!id) return;

    async function loadState() {
      const { data } = await supabase
        .from('game_states')
        .select('*')
        .eq('table_id', id)
        .single();
      setState(data?.state || null);
    }

    // initial load
    loadState();

    // realtime updates
    const channel = supabase
      .channel(`table-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_states', filter: `table_id=eq.${id}` },
        loadState
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  async function load(){
    const { data } = await supabase.from('game_states').select('*').eq('table_id', id).single()
    setState(data?.state || null)
  }

  async function start(mode: 'solo'|'parejas'){
    const res = await fetch('/api/juez', { method:'POST', body: JSON.stringify({ action:'start', tableId:id, mode }) })
    if (!res.ok) alert(await res.text())
  }

  async function play(card: Card){
    const res = await fetch('/api/juez', { method:'POST', body: JSON.stringify({ action:'play', tableId:id, player: me, card }) })
    if (!res.ok) alert(await res.text())
  }

  async function shunsho(against:'A'|'B'){
    const res = await fetch('/api/juez', { method:'POST', body: JSON.stringify({ action:'shunsho', tableId:id, against }) })
    if (!res.ok) alert(await res.text())
  }

  const myHand: Card[] = useMemo(()=>{
    if (!state) return []
    const seat = (state.players as string[]).indexOf(me)
    if (seat<0) return []
    return state.hands[seat] as Card[]
  },[state, me])

  return (
    <main className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Mesa {id?.slice(0,6)}</h1>
        <div className="flex gap-2">
          <button onClick={()=>start('solo')} className="btn bg-neutral-900 text-white">Iniciar 2P</button>
          <button onClick={()=>start('parejas')} className="btn bg-white border">Iniciar Parejas</button>
        </div>
      </div>

      <ScoreStrip a={state?.scores?.A||0} b={state?.scores?.B||0} at38A={state?.at38?.A} at38B={state?.at38?.B} />

      <div className="card p-4 min-h-[260px]">
        <div className="text-sm opacity-70 mb-2">Turno: asiento {state?.turnSeat}</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {(state?.mesa||[]).map((c:Card,i:number)=> <CardFace key={i} card={c}/>) }
          {(!state || state.mesa?.length===0) && <div className="opacity-50">(Mesa vacía)</div>}
        </div>
        <div className="text-sm opacity-70 mb-1">Tus cartas</div>
        <div className="flex flex-wrap gap-2">
          {myHand.map((c:Card,i:number)=> (
            <button key={i} onClick={()=>play(c)} title="Jugar" className="hover:scale-105 transition">
              <CardFace card={c}/>
            </button>
          ))}
          {myHand.length===0 && <div className="opacity-50">(Sin cartas; espera la siguiente repartición)</div>}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={()=>shunsho('A')} className="btn bg-white border">2 por shunsho a A</button>
        <button onClick={()=>shunsho('B')} className="btn bg-white border">2 por shunsho a B</button>
      </div>
    </main>
  )
}
