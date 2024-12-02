import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    // In production, use environment variable for password
    const isValid = password === process.env.SITE_PASSWORD
    
    return NextResponse.json({ authorized: isValid })
  } catch (error) {
    return NextResponse.json({ authorized: false }, { status: 400 })
  }
} 