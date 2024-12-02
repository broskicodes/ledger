"use client"

import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { Account, JournalEntry } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ColumnOptions {
  accounts: Account[]
}

export const columns = ({ accounts }: ColumnOptions): ColumnDef<JournalEntry>[] => [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-[120px]"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="w-[120px] whitespace-nowrap">{row.getValue("date")}</div>
    ),
    filterFn: (row, id, value) => {
      if (value === "all") return true
      return (row.getValue("date") as string).startsWith(value)
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-[200px]"
        >
          Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    id: "accounts",
    header: "Accounts",
    cell: ({ row }) => {
      const entry = row.original
      return (
        <div className="space-y-1">
          {entry.debits.map((debit, i) => (
            <div key={i}>{debit.account.name}</div>
          ))}
          {entry.credits.map((credit, i) => (
            <div key={i} className="pl-8">{credit.account.name}</div>
          ))}
        </div>
      )
    },
    filterFn: (row, columnId, filterValue) => {
      if (filterValue === 'all') return true
      const accountIds = [
        ...row.original.debits.map(d => d.account.id),
        ...row.original.credits.map(c => c.account.id)
      ]
      return accountIds.includes(filterValue)
    },
  },
  {
    id: "debit",
    header: "Debit",
    cell: ({ row }) => {
      const entry = row.original
      return (
        <div className="space-y-1">
          {entry.debits.map((debit, i) => (
            <div key={i} className="text-right tabular-nums">
              {debit.amount.toFixed(2)}
            </div>
          ))}
          {entry.credits.map((credit, i) => (
            <div key={i} className="text-right">&nbsp;</div>
          ))}
        </div>
      )
    },
  },
  {
    id: "credit",
    header: "Credit",
    cell: ({ row }) => {
      const entry = row.original
      return (
        <div className="space-y-1">
          {entry.debits.map((debit, i) => (
            <div key={i} className="text-right">&nbsp;</div>
          ))}
          {entry.credits.map((credit, i) => (
            <div key={i} className="text-right tabular-nums">
              {credit.amount.toFixed(2)}
            </div>
          ))}
        </div>
      )
    },
  },
  {
    id: "edit",
    header: "Actions",
    cell: ({ row }) => {
      const ActionCell = () => {
        const router = useRouter()
        const [open, setOpen] = useState(false)
        const [isLoading, setIsLoading] = useState(false)
        const entry = row.original
        const [formData, setFormData] = useState(entry)

        const handleSave = async (e: React.FormEvent) => {
          e.preventDefault()
          setIsLoading(true)
          try {
            const response = await fetch(`/api/journal-entries/${entry.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData),
            })

            if (!response.ok) throw new Error('Failed to update entry')
            
            setOpen(false)
            router.refresh()
          } catch (error) {
            console.error('Error updating entry:', error)
          } finally {
            setIsLoading(false)
          }
        }

        return (
          <Dialog open={open} onOpenChange={setOpen}>
            <div className="flex gap-1">
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Delete this entry?</p>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 py-1 h-8"
                        onClick={(e) => {
                          const popover = (e.target as HTMLElement).closest('[data-radix-popper-content-wrapper]');
                          if (popover) {
                            (popover as HTMLElement).style.display = 'none';
                          }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="px-2 py-1 h-8"
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/journal-entries/${entry.id}`, {
                              method: 'DELETE',
                            })
                            if (!response.ok) throw new Error('Failed to delete entry')
                            router.refresh()
                          } catch (error) {
                            console.error('Error deleting entry:', error)
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Journal Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Debits */}
                <div className="space-y-2">
                  <Label>Debits</Label>
                  {formData.debits.map((debit, index) => (
                    <div key={index} className="flex gap-2">
                      <Select
                        value={debit.account.id}
                        onValueChange={(value) => {
                          const newDebits = [...formData.debits]
                          const selectedAccount = accounts.find(a => a.id === value)
                          newDebits[index] = {
                            ...debit,
                            account: selectedAccount || {} as Account
                          }
                          setFormData({ ...formData, debits: newDebits })
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
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
                        value={debit.amount}
                        onChange={(e) => {
                          const newDebits = [...formData.debits]
                          newDebits[index] = { ...debit, amount: e.target.value === '' ? 0 : Number(e.target.value) }
                          setFormData({ ...formData, debits: newDebits })
                        }}
                        type="number"
                        step="any"
                        className="w-[120px]"
                      />
                    </div>
                  ))}
                </div>

                {/* Credits */}
                <div className="space-y-2">
                  <Label>Credits</Label>
                  {formData.credits.map((credit, index) => (
                    <div key={index} className="flex gap-2">
                      <Select
                        value={credit.account.id}
                        onValueChange={(value) => {
                          const newCredits = [...formData.credits]
                          const selectedAccount = accounts.find(a => a.id === value)
                          newCredits[index] = {
                            ...credit,
                            account: selectedAccount || {} as Account
                          }
                          setFormData({ ...formData, credits: newCredits })
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
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
                        value={credit.amount}
                        onChange={(e) => {
                          const newCredits = [...formData.credits]
                          newCredits[index] = { ...credit, amount: e.target.value === '' ? 0 : Number(e.target.value) }
                          setFormData({ ...formData, credits: newCredits })
                        }}
                        type="number"
                        step="any"
                        className="w-[120px]"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )
      }

      return <ActionCell />
    },
  },
]