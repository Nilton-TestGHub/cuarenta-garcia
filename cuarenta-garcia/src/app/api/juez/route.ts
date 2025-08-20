import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { startGame, playCard, } from '@/lib/juez-engine'
import { DEFAULT_PARTNERS } from '@/lib/names'

export async function POST(req: NextRequest){
  const { action, tableId, mode, player, card } = await req.json()

  if (action==='start'){
    const players = mode==='solo'
      ? ['Nilton','Michael']
      : [DEFAULT_PARTNERS[0][0], DEFAULT_PARTNERS[1][0], DEFAULT_PARTNERS[0][1], DEFAULT_PARTNERS[1][1]]
    const state = startGame(mode, players)
    await supabase.from('game_states').upsert({ table_id: tableId, state }).select()
    return NextResponse.json({ ok:true })
  }

  if (action==='play'){
    const { data } = await supabase.from('game_states').select('*').eq('table_id', tableId).single()
    if (!data) return NextResponse.json({ error:'state not found' }, { status:404 })
    const state = data.state
    const seat = state.players.indexOf(player)
    if (seat<0) return NextResponse.json({ error:'player not in table' }, { status:400 })
    const newState = playCard(state, seat, card)
    await supabase.from('game_states').upsert({ table_id: tableId, state: newState })
    return NextResponse.json({ ok:true })
  }

  if (action==='end-season'){
    const cur = await supabase.from('seasons').select('*').eq('is_current', true).single()
    if (!cur.data) return NextResponse.json({ error:'no current season' }, { status:400 })
    await supabase.from('seasons').update({ is_current:false, ended_at: new Date().toISOString() }).eq('id', cur.data.id)
    await supabase.from('seasons').insert({ seq: cur.data.seq+1, is_current: true })
    return NextResponse.json({ ok:true })
  }

  return NextResponse.json({ error:'unknown action' }, { status:400 })
}
