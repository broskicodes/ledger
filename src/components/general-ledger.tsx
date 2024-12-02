'use client'

import { useState, useEffect } from 'react'
import { LedgerTable } from './ledger-table'
import { NewEntryForm } from './new-entry-form'
import { Button } from '@/components/ui/button'
import { FinancialStatementsModal } from './statements/financial-statements-modal'
import { JournalEntry } from '@/lib/types'

export function GeneralLedger() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showFinancials, setShowFinancials] = useState(false)

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/journal-entries')
      const data = await response.json()
      setEntries(data)
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const addEntry = async (newEntry: Omit<JournalEntry, 'id'>) => {
    await fetchEntries()
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowFinancials(true)}
            >
              View Financial Statements
            </Button>
          </div>
          <LedgerTable entries={entries} />
          <NewEntryForm onAddEntry={addEntry} />
          <FinancialStatementsModal 
            entries={entries}
            open={showFinancials}
            onClose={() => setShowFinancials(false)}
          />
        </>
      )}
    </div>
  )
}

