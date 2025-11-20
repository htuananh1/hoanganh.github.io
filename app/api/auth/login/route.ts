import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { storage } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      )
    }
    
    const user = storage.users.find(u => u.username === username && u.password === password)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Create session
    const sessionId = `session_${Date.now()}_${Math.random()}`
    storage.sessions.set(sessionId, user.id)
    
    const cookieStore = await cookies()
    cookieStore.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    return NextResponse.json({
      message: 'Login successful',
      user_id: user.id,
      username: user.username
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
