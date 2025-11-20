import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { storage } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const { username, password, email } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      )
    }
    
    if (storage.users.find(u => u.username === username)) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }
    
    const user = {
      id: uuidv4(),
      username,
      password, // In production, hash this
      email: email || '',
      created_at: new Date().toISOString(),
      stats: {
        games_played: 0,
        games_won: 0,
        total_chips: 10000,
        win_rate: 0
      }
    }
    
    storage.users.push(user)
    
    return NextResponse.json({
      message: 'User created successfully',
      user_id: user.id
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
