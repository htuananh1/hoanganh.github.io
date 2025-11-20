const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async register(username: string, password: string, email?: string) {
    return this.request('/api/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email }),
    })
  }

  async login(username: string, password: string) {
    return this.request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  }

  async logout() {
    return this.request('/api/logout', {
      method: 'POST',
    })
  }

  async getProfile() {
    return this.request('/api/user/profile')
  }

  async listGames(status: string = 'waiting') {
    return this.request(`/api/games/list?status=${status}`)
  }

  async createGame(betAmount: number, maxPlayers: number = 4) {
    return this.request('/api/game/create', {
      method: 'POST',
      body: JSON.stringify({ bet_amount: betAmount, max_players: maxPlayers }),
    })
  }

  async joinGame(gameId: number) {
    return this.request(`/api/game/${gameId}/join`, {
      method: 'POST',
    })
  }

  async startGame(gameId: number) {
    return this.request(`/api/game/${gameId}/start`, {
      method: 'POST',
    })
  }

  async gameAction(gameId: number, action: string) {
    return this.request(`/api/game/${gameId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    })
  }

  async playCards(gameId: number, cardIndices: number[], playType: string) {
    return this.request(`/api/game/${gameId}/play`, {
      method: 'POST',
      body: JSON.stringify({ card_indices: cardIndices, play_type: playType }),
    })
  }

  async passTurn(gameId: number) {
    return this.request(`/api/game/${gameId}/pass`, {
      method: 'POST',
    })
  }

  async declareSam(gameId: number) {
    return this.request(`/api/game/${gameId}/declare_sam`, {
      method: 'POST',
    })
  }

  async getGameState(gameId: number) {
    return this.request(`/api/game/${gameId}/state`)
  }

  async backup(method: string = 'github') {
    return this.request('/api/backup', {
      method: 'POST',
      body: JSON.stringify({ method }),
    })
  }

  async deposit(amount: number) {
    return this.request('/api/currency/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
  }

  async withdraw(amount: number) {
    return this.request('/api/currency/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
  }

  async createAIGame(betAmount: number, difficulty: string) {
    return this.request('/api/game/create_ai', {
      method: 'POST',
      body: JSON.stringify({ bet_amount: betAmount, difficulty }),
    })
  }
}

export const api = new ApiClient(API_URL)
