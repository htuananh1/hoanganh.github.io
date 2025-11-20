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
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'waiting'
    
    const games = storage.games
      .filter(g => g.status === status)
      .map(g => {
        const creator = storage.users.find(u => u.id === g.creator_id)
        const gameState = typeof g.game_state === 'string' 
          ? JSON.parse(g.game_state) 
          : g.game_state
        
        return {
          id: g.id,
          creator: creator?.username || 'Unknown',
          bet_amount: g.bet_amount,
          max_players: g.max_players,
          players_count: gameState.players?.length || 0,
          created_at: g.created_at
        }
      })
    
    return NextResponse.json({ games })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
