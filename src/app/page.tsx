'use client'

import { GeneralLedger } from '@/components/general-ledger'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useJournalStore } from '@/stores/journal'

export default function Home() {
  const [authorized, setAuthorized] = useState(false)
  const { journalType, setJournalType } = useJournalStore()
  
  useEffect(() => {
    const auth = localStorage.getItem('authorized')
    const expiresAt = localStorage.getItem('expiresAt')
    
    if (auth === 'true' && expiresAt) {
      if (new Date() < new Date(expiresAt)) {
        setAuthorized(true)
      } else {
        localStorage.removeItem('authorized')
        localStorage.removeItem('expiresAt')
      }
    }
  }, [])

  return (
    <main className="container mx-auto p-4">
      {authorized ? (
        <div className="space-y-4">
          <h1 className="text-3xl font-bold mb-6">General Ledger: {journalType}</h1>
          <Tabs className="w-full" value={journalType} onValueChange={setJournalType}>
            <TabsList className="w-full">
              <TabsTrigger value="business" className="w-full">Business</TabsTrigger>
              <TabsTrigger value="personal" className="w-full">Personal</TabsTrigger>
            </TabsList>
          </Tabs>
          <GeneralLedger />
        </div>
      ) : (
        <Dialog open={!authorized}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Password</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const password = (e.target as HTMLFormElement).password.value
                const res = await fetch('/api/auth', {
                  method: 'POST',
                  body: JSON.stringify({ password }),
                  headers: { 'Content-Type': 'application/json' }
                })
                const { authorized } = await res.json()
                
                if (authorized) {
                  const expiresAt = new Date()
                  expiresAt.setDate(expiresAt.getDate() + 7) // 1 week from now
                  
                  localStorage.setItem('authorized', 'true')
                  localStorage.setItem('expiresAt', expiresAt.toISOString())
                  setAuthorized(true)
                }
              }}
              className="space-y-4"
            >
              <input
                type="password"
                name="password"
                className="w-full border rounded px-3 py-2"
                placeholder="Password"
                autoFocus
              />
              <DialogFooter>
                <button 
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Submit
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </main>
  )
}

