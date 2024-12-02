'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Account, AccountEntry } from '@/lib/types'
import { toast } from 'sonner'

type NewEntryFormProps = {
  onAddEntry: (entry: {
    date: string
    description: string
    debits: AccountEntry[]
    credits: AccountEntry[]
  }) => void
}

function evaluateMathExpression(expression: string): number {
  try {
    // Remove all spaces and validate characters
    const sanitized = expression.replace(/\s+/g, '').match(/^[0-9+\-*/().]+$/);
    if (!sanitized) return 0;
    
    // Use Function instead of eval for better safety
    const result = new Function(`return ${expression}`)();
    return typeof result === 'number' && isFinite(result) ? result : 0;
  } catch {
    return 0;
  }
}

export function NewEntryForm({ onAddEntry }: NewEntryFormProps) {
  const [date, setDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [debits, setDebits] = useState<AccountEntry[]>([{ 
    account: { id: '', name: '', type: 'asset' }, 
    amount: 0 
  }])
  const [credits, setCredits] = useState<AccountEntry[]>([{ 
    account: { id: '', name: '', type: 'asset' }, 
    amount: 0 
  }])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [newAccount, setNewAccount] = useState({ name: '', type: 'asset' as const })
  const [isNewAccountDialogOpen, setIsNewAccountDialogOpen] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    const response = await fetch('/api/accounts')
    const data = await response.json()
    setAccounts(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Evaluate math expressions and create new arrays with calculated values
    const evaluatedDebits = debits.map(d => ({
      ...d,
      amount: typeof d.amount === 'string' ? evaluateMathExpression(d.amount) : d.amount
    }))
    
    const evaluatedCredits = credits.map(c => ({
      ...c,
      amount: typeof c.amount === 'string' ? evaluateMathExpression(c.amount) : c.amount
    }))
    
    // Filter out empty entries
    const validDebits = evaluatedDebits.filter(d => d.account.id && d.amount)
    const validCredits = evaluatedCredits.filter(c => c.account.id && c.amount)
    
    // Calculate totals
    const debitTotal = validDebits.reduce((sum, d) => sum + d.amount, 0)
    const creditTotal = validCredits.reduce((sum, c) => sum + c.amount, 0)

    // If one side is empty and the other has exactly one entry, auto-fill the empty side
    if (validDebits.length === 0 && validCredits.length === 1 && creditTotal > 0) {
      if (!debits[0].account.id) {
        toast.error('Please select an account for the debit entry')
        return
      }
      validDebits.push({
        ...debits[0],
        amount: creditTotal
      })
    } else if (validCredits.length === 0 && validDebits.length === 1 && debitTotal > 0) {
      if (!credits[0].account.id) {
        toast.error('Please select an account for the credit entry')
        return
      }
      validCredits.push({
        ...credits[0],
        amount: debitTotal
      })
    }

    // Recheck the totals after potential auto-fill
    const finalDebitTotal = validDebits.reduce((sum, d) => sum + d.amount, 0)
    const finalCreditTotal = validCredits.reduce((sum, c) => sum + c.amount, 0)

    if (finalDebitTotal.toFixed(2) !== finalCreditTotal.toFixed(2)) {
      toast.error(`Debits (${finalDebitTotal}) must equal Credits (${finalCreditTotal})`)
      return
    }
    
    try {
      const response = await fetch('/api/journal-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          description,
          debits: validDebits,
          credits: validCredits,
        }),
      })

      if (!response.ok) throw new Error('Failed to create entry')

      onAddEntry({
        date,
        description,
        debits: validDebits,
        credits: validCredits,
      })

      // Reset form
      setDate(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0])
      setDescription('')
      setDebits([{ account: { id: '', name: '', type: 'asset' }, amount: 0 }])
      setCredits([{ account: { id: '', name: '', type: 'asset' }, amount: 0 }])
      
      toast.success('Entry added successfully')
    } catch (error) {
      console.error('Error creating entry:', error)
      toast.error('Failed to create entry')
    }
  }

  const handleCreateAccount = async () => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount),
      })

      if (!response.ok) throw new Error('Failed to create account')

      await fetchAccounts()
      setIsNewAccountDialogOpen(false)
      setNewAccount({ name: '', type: 'asset' })
    } catch (error) {
      console.error('Error creating account:', error)
    }
  }

  const addDebit = () => setDebits([...debits, { 
    account: { id: '', name: '', type: 'asset' }, 
    amount: 0 
  }])
  const addCredit = () => setCredits([...credits, { 
    account: { id: '', name: '', type: 'asset' }, 
    amount: 0 
  }])

  const removeDebit = (index: number) => {
    if (debits.length > 1) {
      setDebits(debits.filter((_, i) => i !== index))
    }
  }

  const removeCredit = (index: number) => {
    if (credits.length > 1) {
      setCredits(credits.filter((_, i) => i !== index))
    }
  }

  const updateDebit = (index: number, field: 'account' | 'amount', value: string) => {
    const newDebits = [...debits]
    if (field === 'account') {
      const account = accounts.find(a => a.id === value)
      if (account) {
        newDebits[index] = {
          ...newDebits[index],
          account
        }
      }
    } else {
      newDebits[index] = {
        ...newDebits[index],
        // @ts-ignore
        [field]: field === 'amount' ? value : value
      }
    }
    setDebits(newDebits)
  }

  const updateCredit = (index: number, field: 'account' | 'amount', value: string) => {
    const newCredits = [...credits]
    if (field === 'account') {
      const account = accounts.find(a => a.id === value)
      if (account) {
        newCredits[index] = {
          ...newCredits[index],
          account
        }
      }
    } else {
      newCredits[index] = {
        ...newCredits[index],
        // @ts-ignore
        [field]: field === 'amount' ? value : value
      }
    }
    setCredits(newCredits)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Add New Entry</h2>
        <Dialog open={isNewAccountDialogOpen} onOpenChange={setIsNewAccountDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">New Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account-name">Account Name</Label>
                <Input
                  id="account-name"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-type">Account Type</Label>
                <Select
                  value={newAccount.type}
                  onValueChange={(value) => setNewAccount({ ...newAccount, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" onClick={handleCreateAccount}>Create Account</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Debits</Label>
          {debits.map((debit, index) => (
            <div key={index} className="flex space-x-2">
              <Select
                value={debit.account.id}
                onValueChange={(value) => updateDebit(index, 'account', value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                step="0.01"
                placeholder="Amount"
                value={debit.amount || ''}
                onChange={(e) => updateDebit(index, 'amount', e.target.value)}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeDebit(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addDebit}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Debit
          </Button>
        </div>
        <div className="space-y-2">
          <Label>Credits</Label>
          {credits.map((credit, index) => (
            <div key={index} className="flex space-x-2">
              <Select
                value={credit.account.id}
                onValueChange={(value) => updateCredit(index, 'account', value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                step="0.01"
                placeholder="Amount"
                value={credit.amount || ''}
                onChange={(e) => updateCredit(index, 'amount', e.target.value)}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeCredit(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addCredit}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Credit
          </Button>
        </div>
      </div>
      <Button type="submit">Add Entry</Button>
    </form>
  )
}

