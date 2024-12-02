import { db } from "@/lib/db/drizzle"
import { journalEntries, accountsEntries, accounts } from "@/lib/db/schema"
import { eq, isNull } from "drizzle-orm"
import { NextResponse } from "next/server"
import { JournalEntry } from "@/lib/types"
import { Trash2 } from "lucide-react"

export async function GET() {
  try {
    const entries = await db
      .select()
      .from(journalEntries)
      .leftJoin(accountsEntries, eq(journalEntries.id, accountsEntries.journalEntryId))
      .leftJoin(accounts, eq(accountsEntries.account_id, accounts.id))
      .where(isNull(journalEntries.deletedAt))
    
    // Group account entries by journal entry
    const formattedEntries = entries.reduce<JournalEntry[]>((acc, entry) => {
      const journalEntry = acc.find(je => je.id === entry.journal_entries.id)
      
      if (!journalEntry) {
        acc.push({
          id: entry.journal_entries.id,
          date: entry.journal_entries.date.toISOString().split('T')[0],
          description: entry.journal_entries.description,
          debits: entry.account_entries?.entryType === 'debit' ? [{
            account: {
              id: entry.account_entries.account_id,
              name: entry.accounts?.name!,
              type: entry.accounts?.type!
            },
            amount: entry.account_entries.amount
          }] : [],
          credits: entry.account_entries?.entryType === 'credit' ? [{
            account: {
              id: entry.account_entries.account_id,
              name: entry.accounts?.name!,
              type: entry.accounts?.type!
            },
            amount: entry.account_entries.amount
          }] : []
        })
      } else {
        if (entry.account_entries?.entryType === 'debit') {
          journalEntry.debits.push({
            account: {
              id: entry.account_entries.account_id,
              name: entry.accounts?.name!,
              type: entry.accounts?.type!
            },
            amount: entry.account_entries.amount
          })
        } else if (entry.account_entries?.entryType === 'credit') {
          journalEntry.credits.push({
            account: {
              id: entry.account_entries.account_id,
              name: entry.accounts?.name!,
              type: entry.accounts?.type!
            },
            amount: entry.account_entries.amount
          })
        }
      }
      return acc
    }, [])

    return NextResponse.json(formattedEntries)
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const journalEntry = await db.transaction(async (tx) => {
      // Create journal entry
      const [entry] = await tx
        .insert(journalEntries)
        .values({
          date: new Date(body.date),
          description: body.description,
        })
        .returning()

      // Insert all debits and credits
      await tx.insert(accountsEntries).values([
        ...body.debits.map((debit: any) => ({
          entryType: 'debit',
          amount: debit.amount,
          account_id: debit.account.id,
          journalEntryId: entry.id,
        })),
        ...body.credits.map((credit: any) => ({
          entryType: 'credit',
          amount: credit.amount,
          account_id: credit.account.id,
          journalEntryId: entry.id,
        })),
      ])

      return entry
    })

    return NextResponse.json(journalEntry)
  } catch (error) {
    console.error('Error creating journal entry:', error)
    return NextResponse.json({ error: 'Failed to create journal entry' }, { status: 500 })
  }
}
