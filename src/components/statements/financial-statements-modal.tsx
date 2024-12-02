import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { JournalEntry, Account } from '@/lib/types'
import { useState, useEffect, useMemo } from 'react'
import { TrialBalance } from './trial-balance'
import { IncomeStatement } from './income-statement'
import { BalanceSheet } from './balance-sheet'
import { ScrollArea } from '@/components/ui/scroll-area'

interface FinancialStatementsModalProps {
  entries: JournalEntry[]
  open: boolean
  onClose: () => void
}

export function FinancialStatementsModal({ entries, open, onClose }: FinancialStatementsModalProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  )
  const [accounts, setAccounts] = useState<Account[]>([])
  
  useEffect(() => {
    const fetchAccounts = async () => {
      const response = await fetch('/api/accounts')
      const data = await response.json()
      setAccounts(data)
    }
    fetchAccounts()
  }, [])

  const availableMonths = useMemo(() => 
    [...new Set(entries.map(entry => entry.date.slice(0, 7)))].sort().reverse(),
    [entries]
  )

  // Filter entries for the selected month
  const monthlyEntries = useMemo(() => 
    entries.filter(entry => entry.date.startsWith(selectedMonth)),
    [entries, selectedMonth]
  )

  // Get all entries up to the end of selected month for balance sheet
  const balanceSheetEntries = useMemo(() => 
    entries.filter(entry => entry.date <= `${selectedMonth}-31`),
    [entries, selectedMonth]
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Financial Statements</DialogTitle>
        </DialogHeader>
        
        <div className="w-[200px] mb-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map(month => (
                <SelectItem key={month} value={month}>
                  {new Date(month + "-05").toLocaleDateString('en-CA', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="income" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="income">Income Statement</TabsTrigger>
            <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
            <TabsTrigger value="trial">Trial Balance</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[600px]">
            <TabsContent value="income">
              <IncomeStatement 
                entries={monthlyEntries} 
                period={`${selectedMonth}-05`} 
              />
            </TabsContent>
            <TabsContent value="balance">
              <BalanceSheet 
                entries={balanceSheetEntries} 
                asOf={`${selectedMonth}-31`} 
              />
            </TabsContent>
            <TabsContent value="trial">
              <TrialBalance 
                entries={monthlyEntries} 
                period={`${selectedMonth}-05`}
                accounts={accounts}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 