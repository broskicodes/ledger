import { db } from "@/lib/db/drizzle"
import { accounts } from "@/lib/db/schema"
import { isNull } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const allAccounts = await db.select().from(accounts).where(isNull(accounts.deletedAt))      
    return NextResponse.json(allAccounts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newAccount = await db
      .insert(accounts)
      .values({
        name: body.name,
        type: body.type,
      })
      .returning()

    return NextResponse.json(newAccount[0])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
} 