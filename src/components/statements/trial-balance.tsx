import { JournalEntry, Account, AccountEntry } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import React from 'react'

interface TrialBalanceProps {
  entries: JournalEntry[]
  period: string
  accounts: Account[]
}

const ACCOUNT_TYPES = {
  asset: 'Assets',
  liability: 'Liabilities',
  equity: 'Equity',
  revenue: 'Revenue',
  expense: 'Expenses'
} as const

const displayOrder: Account['type'][] = [
  'asset',
  'liability',
  'equity',
  'revenue',
  'expense'
]

export function TrialBalance({ entries, period, accounts }: TrialBalanceProps) {
  const accountTypeMap = accounts.reduce((acc, account) => {
    acc[account.name] = account.type
    return acc
  }, {} as Record<string, Account['type']>)

  const trialBalance = entries.reduce((acc, entry) => {
    entry.debits.forEach((debit: AccountEntry) => {
      acc[debit.account.name] = (acc[debit.account.name] || 0) + debit.amount
    })
    entry.credits.forEach((credit: AccountEntry) => {
      acc[credit.account.name] = (acc[credit.account.name] || 0) - credit.amount
    })
    return acc
  }, {} as Record<string, number>)

  const accountsByType = Object.entries(trialBalance).reduce((acc, [account, amount]) => {
    const type = accountTypeMap[account] || 'asset'
    if (!acc[type]) acc[type] = []
    acc[type].push([account, amount])
    return acc
  }, {} as Record<Account['type'], [string, number][]>)

  const totalDebits = Object.values(trialBalance)
    .reduce((sum, amount) => sum + (amount > 0 ? amount : 0), 0)
  const totalCredits = Object.values(trialBalance)
    .reduce((sum, amount) => sum + (amount < 0 ? -amount : 0), 0)

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-center">Trial Balance</h3>
      <p className="text-center text-muted-foreground">
        As of {new Date(period).toLocaleDateString('en-CA', { 
          year: 'numeric', 
          month: 'long' 
        })}
      </p>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Account</th>
            <th className="text-right py-2">Debit</th>
            <th className="text-right py-2">Credit</th>
          </tr>
        </thead>
        <tbody>
          {displayOrder.map(type => (
            accountsByType[type]?.length > 0 && (
              <React.Fragment key={type}>
                <tr className="bg-muted/50">
                  <td colSpan={3} className="py-2 px-2 font-semibold">
                    {ACCOUNT_TYPES[type]}
                  </td>
                </tr>
                {accountsByType[type]
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([account, amount]) => (
                    <tr key={account} className="border-b">
                      <td className="py-2 pl-4">{account}</td>
                      <td className="text-right py-2">
                        {amount > 0 ? formatCurrency(amount) : ''}
                      </td>
                      <td className="text-right py-2">
                        {amount < 0 ? formatCurrency(-amount) : ''}
                      </td>
                    </tr>
                ))}
              </React.Fragment>
            )
          ))}
          <tr className="font-bold border-t-2">
            <td className="py-2">Total</td>
            <td className="text-right py-2">{formatCurrency(totalDebits)}</td>
            <td className="text-right py-2">{formatCurrency(totalCredits)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
} 