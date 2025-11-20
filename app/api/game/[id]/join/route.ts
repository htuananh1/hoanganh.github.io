import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { storage, getUserIdFromSession } from '@/lib/storage'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const gameId = params.id
    const game = storage.games.find(g => g.id === gameId)
    
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }
    
    if (game.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Game already started' },
        { status: 400 }
      )
    }
    
    const user = storage.users.find(u => u.id === userId)
    if (!user || user.stats.total_chips < game.bet_amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }
    
    const gameState = typeof game.game_state === 'string'
      ? JSON.parse(game.game_state)
      : game.game_state
    
    if (gameState.players.length >= game.max_players) {
      return NextResponse.json(
        { error: 'Game is full' },
        { status: 400 }
      )
    }
    
    if (gameState.players.includes(userId)) {
      return NextResponse.json(
        { error: 'Already in game' },
        { status: 400 }
      )
    }
    
    // Deduct bet amount
    user.stats.total_chips -= game.bet_amount
    
    // Add player
    gameState.players.push(userId)
    game.game_state = gameState
    
    return NextResponse.json({
      message: 'Joined game successfully',
      players: gameState.players.length
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
