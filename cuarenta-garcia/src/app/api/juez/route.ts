import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { startGame, playCard, } from '@/lib/juez-engine'
import { DEFAULT_PARTNERS } from '@/lib/names'

export async function POST(req: NextRequest){
  const { action, tableId, mode, player, card } = await req.json()

  if (action === 'start') {
  // Who has joined this mesa?
  const { data: joined, error: jerr } = await supabase
    .from('table_players')
    .select('player_name, joined_at')
    .eq('table_id', tableId)
    .order('joined_at', { ascending: true });

  if (jerr) {
    return NextResponse.json({ error: jerr.message }, { status: 400 });
  }

  let players: string[] = [];

  if (mode === 'solo') {
    players = (joined?.map(r => r.player_name) ?? []).slice(0, 2);
    if (players.length < 2) {
      return NextResponse.json({ error: 'Necesitas 2 jugadores en la mesa antes de iniciar.' }, { status: 400 });
    }
  } else {
    // Prefer fixed partners if both members are present. Seat A-B-A-B so partners sit enfrente.
    const present = new Set(joined?.map(r => r.player_name) ?? []);
    const preferred: string[] = [];
    for (const [a, b] of DEFAULT_PARTNERS) {
      if (present.has(a) && present.has(b)) preferred.push(a, b);
    }
    if (preferred.length >= 4) {
      players = [preferred[0], preferred[2], preferred[1], preferred[3]];
    } else {
      const first4 = (joined?.map(r => r.player_name) ?? []).slice(0, 4);
      if (first4.length < 4) {
        return NextResponse.json({ error: 'Se requieren 4 jugadores para parejas.' }, { status: 400 });
      }
      players = [first4[0], first4[2], first4[1], first4[3]];
    }
  }

  const state = startGame(mode, players);
  await supabase.from('game_states').upsert({ table_id: tableId, state });
  return NextResponse.json({ ok: true });
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
