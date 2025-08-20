export type Suit = '♣'|'♦'|'♥'|'♠'
export type Rank = 'A'|'2'|'3'|'4'|'5'|'6'|'7'|'J'|'Q'|'K'
export type Card = { rank: Rank, suit: Suit }

export const SUITS: Suit[] = ['♣','♦','♥','♠']
export const RANKS: Rank[] = ['A','2','3','4','5','6','7','J','Q','K']

export function makeDeck(): Card[] {
  const deck: Card[] = []
  for (const s of SUITS) for (const r of RANKS) deck.push({ rank: r, suit: s })
  return deck
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i=a.length-1;i>0;i--) {
    const j = Math.floor(Math.random()*(i+1))
    ;[a[i],a[j]]=[a[j],a[i]]
  }
  return a
}

export function rankValue(r: Rank): number {
  switch(r){ case 'A': return 1; case 'J': return 11; case 'Q': return 12; case 'K': return 13; default: return parseInt(r,10) }
}
export function equalRank(a: Card, b: Card) { return a.rank===b.rank }
