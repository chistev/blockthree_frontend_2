import React from 'react'
import { Button } from '../components/Primitives'

export default function Landing({ setPage }: { setPage: (p: string) => void }) {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center px-4">
        <h1 className="font-inter-tight text-[28px] font-semibold tracking-tight mb-4">Block Three Capital</h1>
        <p className="font-ibm-plex-sans text-[16px] mb-6 max-w-md leading-relaxed">Optimize your Bitcoin treasury with institutional-grade stochastic modeling and risk metrics.</p>
        <Button variant="primary" onClick={() => setPage('assumptions')}>Begin Optimization</Button>
      </div>
    </>
  )
}
