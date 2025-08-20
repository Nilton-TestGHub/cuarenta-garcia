import { Card } from '@/lib/rules'

export default function CardFace({ card }: { card: Card }){
  const red = card.suit==='♦' || card.suit==='♥'
  return (
    <div className={`w-10 h-14 md:w-12 md:h-16 rounded-xl border bg-white flex items-center justify-center text-lg font-semibold ${red?'text-red-600':'text-neutral-900'}`}>
      {card.rank}{card.suit}
    </div>
  )
}
