import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { storage, getUserIdFromSession } from '@/lib/storage'
import { v4 as uuidv4 } from 'uuid'

// Simple game state (in production, use proper game logic)
function createGameState() {
  return {
    players: [],
    game_started: false,
    game_over: false,
    current_player: 0,
    last_play: null,
    player_hands: {},
    player_hand_counts: {}
  }
}

export async function POST(request: NextRequest) {
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
    
    const { bet_amount, max_players } = await request.json()
    const betAmount = bet_amount || 1000
    const maxPlayers = max_players || 4
    
    const user = storage.users.find(u => u.id === userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    if (user.stats.total_chips < betAmount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }
    
    // Deduct bet amount
    user.stats.total_chips -= betAmount
    
    const gameState = createGameState()
    gameState.players.push(userId)
    
    const game = {
      id: uuidv4(),
      creator_id: userId,
      bet_amount: betAmount,
      max_players: maxPlayers,
      status: 'waiting' as const,
      game_state: gameState,
      created_at: new Date().toISOString()
    }
    
    storage.games.push(game)
    
    return NextResponse.json({
      game_id: game.id,
      message: 'Game created successfully'
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
