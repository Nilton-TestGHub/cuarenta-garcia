import { Card, makeDeck, shuffle, equalRank, rankValue } from './rules'

export type PlayerSlot = 0|1|2|3
export type Mode = 'solo'|'parejas'

export type JuezEvent =
 | { type: 'caida', by: string, card: Card, points: 2 }
 | { type: 'limpia', by: string, points: 2 }
 | { type: 'shunsho', against: 'A'|'B', points: 2 }
 | { type: 'capture', by: string, using: Card, taken: Card[] }
 | { type: 'deal', dealerSeat: PlayerSlot }
 | { type: 'turn', seat: PlayerSlot }
 | { type: 'end-round' }
 | { type: 'end-game', winner: 'A'|'B', reason: 'points'|'caida40' }

export type Side = 'A'|'B'

export interface TableState {
  id: string
  mode: Mode
  players: string[]
  deck: Card[]
  hands: Card[][]
  mesa: Card[]
  captured: { A: Card[], B: Card[] }
  scores: { A: number, B: number }
  at38: { A: boolean, B: boolean }
  dealerSeat: PlayerSlot
  turnSeat: PlayerSlot
  log: JuezEvent[]
}

function sideOfSeat(mode: Mode, seat: PlayerSlot): Side {
  if (mode==='solo') return seat===0? 'A' : 'B'
  return (seat===0 || seat===2) ? 'A' : 'B'
}

export function startGame(mode: Mode, players: string[]): TableState {
  const fullDeck = shuffle(makeDeck())
  const seats = mode==='solo'?2:4
  const hands: Card[][] = Array.from({length: seats},()=>[])
  const dealerSeat = (Math.floor(Math.random()*seats) as PlayerSlot)
  const deck = fullDeck.slice()
  const mesa: Card[] = []
  const captured = { A: [] as Card[], B: [] as Card[] }
  for (let i=0;i<5;i++){ for (let s=0;s<seats;s++){ const idx=(dealerSeat+1+s)%seats; hands[idx].push(deck.shift()!) } }
  return { id: 'tbl-'+Math.random().toString(36).slice(2), mode, players, deck, hands, mesa, captured,
           scores:{A:0,B:0}, at38:{A:false,B:false}, dealerSeat, turnSeat: ((dealerSeat+1)%seats) as PlayerSlot, log:[{type:'deal', dealerSeat}] }
}

export function playCard(state: TableState, seat: PlayerSlot, card: Card){
  const hand = state.hands[seat]
  const idx = hand.findIndex(c=>c.rank===card.rank && c.suit===card.suit)
  if (idx<0) throw new Error('Carta no está en la mano')
  hand.splice(idx,1)

  const side = sideOfSeat(state.mode, seat)
  let took: Card[] = []
  let caida = false

  const same = state.mesa.find(c=>equalRank(c,card))
  if (same){
    caida = true
    took.push(...state.mesa.filter(c=>equalRank(c,card)))
    const order: Array<Card['rank']> = ['A','2','3','4','5','6','7','J','Q','K']
    let idxR = order.indexOf(card.rank)
    for (let k=idxR+1;k<order.length;k++){
      const nextRank = order[k]
      const grab = state.mesa.find(c=>c.rank===nextRank)
      if (grab) took.push(grab); else break
    }
  } else {
    const target = rankValue(card.rank)
    const mesaSorted = state.mesa.slice().sort((a,b)=>rankValue(b.rank)-rankValue(a.rank))
    let sum=0
    for (const m of mesaSorted){
      if (sum + rankValue(m.rank) <= target){
        sum += rankValue(m.rank)
        took.push(m)
        if (sum===target) break
      }
    }
    if (sum!==target){
      state.mesa.push(card)
      state.turnSeat = nextSeat(state)
      state.log.push({ type:'turn', seat: state.turnSeat })
      return state
    }
  }

  const mesaSet = new Set(took.map(c=>`${c.rank}${c.suit}`))
  state.mesa = state.mesa.filter(c=>!mesaSet.has(`${c.rank}${c.suit}`))
  const capturedNow = [...took, card]
  state.captured[side].push(...capturedNow)
  state.log.push({ type:'capture', by: state.players[seat], using: card, taken: took })

  let pointsGained = 0
  if (caida) { pointsGained += 2; state.log.push({ type:'caida', by: state.players[seat], card, points: 2 }) }
  if (state.mesa.length===0) { pointsGained += 2; state.log.push({ type:'limpia', by: state.players[seat], points: 2 }) }

  addPoints(state, side, pointsGained, { via: caida?'caida':'other' })

  state.turnSeat = nextSeat(state)
  state.log.push({ type:'turn', seat: state.turnSeat })
  return state
}

function nextSeat(state: TableState): PlayerSlot {
  const seats = state.mode==='solo'?2:4
  return ((state.turnSeat + 1) % seats) as PlayerSlot
}

function addPoints(state: TableState, side: Side, pts: number, opts: { via: 'caida'|'cards'|'other' }){
  if (pts<=0) return
  const cur = state.scores[side]
  const would = cur + pts
  const isCaida = opts.via==='caida'
  if (cur>=38 && would>=40 && !isCaida){ return }
  state.scores[side] = would
  if (state.scores[side] >= 40 && isCaida){
    state.log.push({ type:'end-game', winner: side, reason: 'caida40' })
  }
}
