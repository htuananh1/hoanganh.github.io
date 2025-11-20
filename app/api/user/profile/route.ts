import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { storage, getUserIdFromSession } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session_id')?.value
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const userId = getUserIdFromSession(sessionId)
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }
    
    const user = storage.users.find(u => u.id === userId)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      username: user.username,
      email: user.email,
      created_at: user.created_at,
      stats: user.stats
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
