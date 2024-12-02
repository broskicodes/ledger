import { JournalEntry } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface BalanceSheetProps {
  entries: JournalEntry[]
  asOf: string
}

export function BalanceSheet({ entries, asOf }: BalanceSheetProps) {
  const accountBalances = entries.reduce((acc, entry) => {
    entry.debits.forEach(debit => {
      const accountName = debit.account.name
      if (!acc[accountName]) {
        acc[accountName] = {
          amount: 0,
          type: debit.account.type
        }
      }
      acc[accountName].amount += debit.amount
    })
    entry.credits.forEach(credit => {
      const accountName = credit.account.name
      if (!acc[accountName]) {
        acc[accountName] = {
          amount: 0,
          type: credit.account.type
        }
      }
      acc[accountName].amount -= credit.amount
    })
    return acc
  }, {} as Record<string, { amount: number, type: string }>)

  const assets = Object.entries(accountBalances)
    .filter(([_, data]) => data.type === 'asset')
    .map(([account, data]) => ({ account, amount: data.amount }))

  const liabilities = Object.entries(accountBalances)
    .filter(([_, data]) => data.type === 'liability')
    .map(([account, data]) => ({ account, amount: -data.amount }))

  const revenues = Object.entries(accountBalances)
    .filter(([_, data]) => data.type === 'revenue')
    .reduce((sum, [_, data]) => sum - data.amount, 0)

  const expenses = Object.entries(accountBalances)
    .filter(([_, data]) => data.type === 'expense')
    .reduce((sum, [_, data]) => sum + data.amount, 0)

  const netIncome = revenues - expenses

  const equityAccounts = Object.entries(accountBalances)
    .filter(([_, data]) => data.type === 'equity')
    .map(([account, data]) => ({ account, amount: -data.amount }))

  const equity = [
    ...equityAccounts,
    { account: 'Retained Earnings', amount: netIncome }
  ]

  const totalAssets = assets.reduce((sum, { amount }) => sum + amount, 0)
  const totalLiabilities = liabilities.reduce((sum, { amount }) => sum + amount, 0)
  const totalEquity = equity.reduce((sum, { amount }) => sum + amount, 0)

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-center">Balance Sheet</h3>
      <p className="text-center text-muted-foreground">
        As of {new Date(asOf).toLocaleDateString('en-CA', { 
          year: 'numeric', 
          month: 'long',
          day: 'numeric'
        })}
      </p>

      <div className="space-y-6">
        <div>
          <h4 className="font-semibold mb-2">Assets</h4>
          {assets.map(({ account, amount }) => (
            <div key={account} className="flex justify-between py-1">
              <span className="pl-4">{account}</span>
              <span>{formatCurrency(amount)}</span>
            </div>
          ))}
          <div className="flex justify-between py-1 font-bold border-t">
            <span>Total Assets</span>
            <span>{formatCurrency(totalAssets)}</span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Liabilities</h4>
          {liabilities.map(({ account, amount }) => (
            <div key={account} className="flex justify-between py-1">
              <span className="pl-4">{account}</span>
              <span>{formatCurrency(amount)}</span>
            </div>
          ))}
          <div className="flex justify-between py-1 font-medium border-t">
            <span>Total Liabilities</span>
            <span>{formatCurrency(totalLiabilities)}</span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Equity</h4>
          {equity.map(({ account, amount }) => (
            <div key={account} className="flex justify-between py-1">
              <span className="pl-4">{account}</span>
              <span>{formatCurrency(amount)}</span>
            </div>
          ))}
          <div className="flex justify-between py-1 font-medium border-t">
            <span>Total Equity</span>
            <span>{formatCurrency(totalEquity)}</span>
          </div>
        </div>

        <div className="flex justify-between py-2 font-bold border-t-2">
          <span>Total Liabilities and Equity</span>
          <span>{formatCurrency(totalLiabilities + totalEquity)}</span>
        </div>
      </div>
    </div>
  )
} 