// Shared in-memory storage for Vercel deployment
// In production, replace with database (Vercel Postgres, MongoDB, etc.)

export interface User {
  id: string
  username: string
  password: string
  email: string
  created_at: string
  stats: {
    games_played: number
    games_won: number
    total_chips: number
    win_rate: number
  }
}

export interface GameSession {
  id: string
  creator_id: string
  bet_amount: number
  max_players: number
  status: 'waiting' | 'playing' | 'finished'
  game_state: any
  created_at: string
}

// In-memory storage
export const storage = {
  users: [] as User[],
  games: [] as GameSession[],
  sessions: new Map<string, string>(), // session_id -> user_id
}

// Helper functions
export function getUserById(userId: string): User | undefined {
  return storage.users.find(u => u.id === userId)
}

export function getUserByUsername(username: string): User | undefined {
  return storage.users.find(u => u.username === username)
}

export function getGameById(gameId: string): GameSession | undefined {
  return storage.games.find(g => g.id === gameId)
}

export function getUserIdFromSession(sessionId: string): string | undefined {
  return storage.sessions.get(sessionId)
}
