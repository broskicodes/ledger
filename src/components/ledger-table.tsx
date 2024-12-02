import { JournalEntry } from '@/lib/types'
import { columns } from './ledger-table/columns'
import { DataTable } from './ledger-table/data-table'

type LedgerTableProps = {
  entries: JournalEntry[]
}

export function LedgerTable({ entries }: LedgerTableProps) {
  // Get unique accounts with both id and name
  const accounts = Array.from(
    new Set(
      entries.flatMap(entry => [
        ...entry.debits.map(d => ({ id: d.account.id, name: d.account.name, type: d.account.type })),
        ...entry.credits.map(c => ({ id: c.account.id, name: c.account.name, type: c.account.type }))
      ]).map(a => JSON.stringify(a))
    )
  ).map(str => JSON.parse(str))

  return <DataTable data={entries} accounts={accounts} />
}

