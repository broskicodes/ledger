import { JournalEntry } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface IncomeStatementProps {
  entries: JournalEntry[]
  period: string
}

export function IncomeStatement({ entries, period }: IncomeStatementProps) {
  const accountBalances = entries.reduce((acc, entry) => {
    entry.debits.forEach(debit => {
      const accountName = debit.account.name
      acc[accountName] = {
        type: debit.account.type,
        amount: (acc[accountName]?.amount || 0) + debit.amount
      }
    })
    entry.credits.forEach(credit => {
      const accountName = credit.account.name
      acc[accountName] = {
        type: credit.account.type,
        amount: (acc[accountName]?.amount || 0) - credit.amount
      }
    })
    return acc
  }, {} as Record<string, { type: string; amount: number }>)

  const revenues = Object.entries(accountBalances)
    .filter(([_, { type }]) => type === 'revenue')
    .map(([account, { amount }]) => ({ account, amount: -amount }))

  const expenses = Object.entries(accountBalances)
    .filter(([_, { type }]) => type === 'expense')
    .map(([account, { amount }]) => ({ account, amount }))

  const totalRevenue = revenues.reduce((sum, { amount }) => sum + amount, 0)
  const totalExpenses = expenses.reduce((sum, { amount }) => sum + amount, 0)
  const netIncome = totalRevenue - totalExpenses

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-center">Income Statement</h3>
      <p className="text-center text-muted-foreground">
        For the month ending {new Date(period).toLocaleDateString('en-CA', { 
          year: 'numeric', 
          month: 'long' 
        })}
      </p>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Revenues</h4>
          {revenues.map(({ account, amount }) => (
            <div key={account} className="flex justify-between py-1">
              <span className="pl-4">{account}</span>
              <span>{formatCurrency(amount)}</span>
            </div>
          ))}
          <div className="flex justify-between py-1 font-medium border-t">
            <span>Total Revenue</span>
            <span>{formatCurrency(totalRevenue)}</span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Expenses</h4>
          {expenses.map(({ account, amount }) => (
            <div key={account} className="flex justify-between py-1">
              <span className="pl-4">{account}</span>
              <span>{formatCurrency(amount)}</span>
            </div>
          ))}
          <div className="flex justify-between py-1 font-medium border-t">
            <span>Total Expenses</span>
            <span>{formatCurrency(totalExpenses)}</span>
          </div>
        </div>

        <div className="flex justify-between py-2 font-bold border-t-2">
          <span>Net Income</span>
          <span>{formatCurrency(netIncome)}</span>
        </div>
      </div>
    </div>
  )
} 