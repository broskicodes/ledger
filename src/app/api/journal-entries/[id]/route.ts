import { db } from "@/lib/db/drizzle"
import { journalEntries, accountsEntries } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = await params.id
  try {
    const updatedEntry = await request.json()

    
    const result = await db.transaction(async (tx) => {
      // Update the journal entry
      const [entry] = await tx
        .update(journalEntries)
        .set({
          date: new Date(updatedEntry.date),
          description: updatedEntry.description,
          updatedAt: new Date(),
        })
        .where(eq(journalEntries.id, id))
        .returning()

      // Delete existing account entries
      await tx
        .delete(accountsEntries)
        .where(eq(accountsEntries.journalEntryId, id))


      // Insert new account entries
      await tx.insert(accountsEntries).values([
        ...updatedEntry.debits.map((debit: any) => ({
          entryType: 'debit',
          amount: debit.amount,
          account_id: debit.account.id,
          journalEntryId: entry.id,
        })),
        ...updatedEntry.credits.map((credit: any) => ({
          entryType: 'credit',
          amount: credit.amount,
          account_id: credit.account.id,
          journalEntryId: entry.id,
        })),
      ])

      return entry
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating journal entry:', error)
    return NextResponse.json(
      { error: 'Failed to update journal entry' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = await params.id
  try {
    await db.transaction(async (tx) => {
      // Soft delete the journal entry
      await tx
        .update(journalEntries)
        .set({ deletedAt: new Date() })
        .where(eq(journalEntries.id, id))
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting journal entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete journal entry' },
      { status: 500 }
    )
  }
} 