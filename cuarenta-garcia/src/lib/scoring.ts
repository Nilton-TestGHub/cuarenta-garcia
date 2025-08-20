export function mapCapturedToPoints(captured: number): number {
  const mapped = captured <= 20 ? captured : 6 + (captured - 20)
  return mapped % 2 === 1 ? mapped + 1 : mapped
}
export function toPerrosTokens(points: number){
  const tens = Math.floor(points/10)
  const twos = Math.floor((points%10)/2)
  return { faceDown: tens, faceUp: twos }
}
