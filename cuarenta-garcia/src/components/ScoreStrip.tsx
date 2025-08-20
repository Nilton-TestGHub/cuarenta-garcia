export default function ScoreStrip({ a, b, at38A, at38B }: { a:number, b:number, at38A:boolean, at38B:boolean }){
  function perroTokens(p:number){
    const tens = Math.floor(p/10)
    const twos = Math.floor((p%10)/2)
    return (
      <div className="flex items-center gap-1">
        {Array.from({length:tens}).map((_,i)=>(<span key={'t'+i} className="px-2 py-1 rounded bg-neutral-900 text-white text-xs">10</span>))}
        {Array.from({length:twos}).map((_,i)=>(<span key={'u'+i} className="px-2 py-1 rounded border text-xs">+2</span>))}
      </div>
    )
  }
  return (
    <div className="card p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="font-semibold">Equipo A</div>
        <div className="text-2xl">{a}</div>
        {at38A && <span className="text-xs px-2 py-1 bg-yellow-100 border rounded">38 que no juega</span>}
        {perroTokens(a)}
      </div>
      <div className="flex items-center gap-3">
        {perroTokens(b)}
        {at38B && <span className="text-xs px-2 py-1 bg-yellow-100 border rounded">38 que no juega</span>}
        <div className="text-2xl">{b}</div>
        <div className="font-semibold">Equipo B</div>
      </div>
    </div>
  )
}
