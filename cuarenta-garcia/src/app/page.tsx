'use client'
import { useEffect, useState } from 'react'
import { ALLOWED_NAMES, AllowedName } from '@/lib/names'
import { DEFAULT_AVATARS } from '@/lib/avatars'
import { useRouter } from 'next/navigation'

export default function Home(){
  const [name, setName] = useState<AllowedName | ''>('')
  const r = useRouter()
  useEffect(()=>{
    const n = localStorage.getItem('playerName') as AllowedName | null
    if (n && ALLOWED_NAMES.includes(n)) setName(n)
  },[])
  function enter(){
    if (!name) return
    localStorage.setItem('playerName', name)
    r.push('/lobby')
  }
  return (
    <main className="grid gap-6">
      <header className="flex items-center gap-3">
        <img src="/logo.svg" alt="logo" className="w-10 h-10"/>
        <h1 className="text-2xl font-bold">Cuarenta — Familia García</h1>
      </header>
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-3">Ingresa con tu nombre</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ALLOWED_NAMES.map(n=> (
            <button key={n} onClick={()=>setName(n)} className={`btn border ${name===n?'bg-neutral-900 text-white':'bg-white'}`}>
              <span className="text-2xl mr-2">{DEFAULT_AVATARS[n]}</span> {n}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <button onClick={enter} disabled={!name} className="btn bg-neutral-900 text-white">Entrar</button>
        </div>
      </div>
    </main>
  )
}
