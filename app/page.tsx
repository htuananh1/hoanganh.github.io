'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Play, 
  Users, 
  Trophy,
  Coins,
  Zap,
  Shield,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import GameBoard from '@/components/GameBoard'
import SamGameBoard from '@/components/SamGameBoard'
import GameList from '@/components/GameList'
import StatsCard from '@/components/StatsCard'
import CurrencyWallet from '@/components/CurrencyWallet'
import AIGameMode from '@/components/AIGameMode'
import { api } from '@/lib/api'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showLogin, setShowLogin] = useState(true)
  const [currentGame, setCurrentGame] = useState<any>(null)
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState(10000) // Default balance

  useEffect(() => {
    checkAuth()
    if (isAuthenticated) {
      loadGames()
    }
  }, [isAuthenticated])

  const checkAuth = async () => {
    try {
      const data = await api.getProfile()
      setUser(data)
      setBalance(data.stats?.total_chips || 10000)
      setIsAuthenticated(true)
      setShowLogin(false)
    } catch (error) {
      setIsAuthenticated(false)
      setShowLogin(true)
    }
  }

  const handleLogin = async (username: string, password: string) => {
    try {
      setLoading(true)
      await api.login(username, password)
      await checkAuth()
      toast.success('Đăng nhập thành công!')
    } catch (error: any) {
      toast.error(error.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (username: string, password: string, email?: string) => {
    try {
      setLoading(true)
      await api.register(username, password, email)
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
      setShowLogin(true)
    } catch (error: any) {
      toast.error(error.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await api.logout()
      setIsAuthenticated(false)
      setUser(null)
      setCurrentGame(null)
      setShowLogin(true)
      toast.success('Đã đăng xuất')
    } catch (error) {
      toast.error('Đăng xuất thất bại')
    }
  }

  const loadGames = async () => {
    try {
      const data = await api.listGames('waiting')
      setGames(data.games || [])
    } catch (error) {
      console.error('Failed to load games:', error)
    }
  }

  const handleCreateGame = async (betAmount: number) => {
    if (betAmount > balance) {
      toast.error('Số dư không đủ!')
      return
    }
    try {
      setLoading(true)
      const data = await api.createGame(betAmount)
      toast.success('Đã tạo phòng!')
      await loadGames()
      await handleJoinGame(data.game_id)
    } catch (error: any) {
      toast.error(error.message || 'Tạo phòng thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAIGame = async (betAmount: number, difficulty: string) => {
    if (betAmount > balance) {
      toast.error('Số dư không đủ!')
      return
    }
    try {
      setLoading(true)
      const data = await api.createAIGame(betAmount, difficulty)
      toast.success('Đã tạo game với AI!')
      await handleJoinGame(data.game_id)
    } catch (error: any) {
      toast.error(error.message || 'Tạo game thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async (amount: number) => {
    try {
      const result = await api.deposit(amount)
      setBalance(result.balance)
      toast.success(`Đã nạp ${amount.toLocaleString()} chip!`)
    } catch (error: any) {
      toast.error(error.message || 'Nạp tiền thất bại')
      throw error
    }
  }

  const handleWithdraw = async (amount: number) => {
    if (amount > balance) {
      toast.error('Số dư không đủ!')
      return
    }
    try {
      const result = await api.withdraw(amount)
      setBalance(result.balance)
      toast.success(`Đã rút ${amount.toLocaleString()} chip!`)
    } catch (error: any) {
      toast.error(error.message || 'Rút tiền thất bại')
      throw error
    }
  }

  const handleJoinGame = async (gameId: number) => {
    try {
      setLoading(true)
      await api.joinGame(gameId)
      const gameState = await api.getGameState(gameId)
      setCurrentGame({ id: gameId, ...gameState.game_state })
      toast.success('Đã tham gia phòng!')
    } catch (error: any) {
      toast.error(error.message || 'Tham gia phòng thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleBackup = async () => {
    try {
      setLoading(true)
      await api.backup('local')
      toast.success('Sao lưu thành công!')
    } catch (error: any) {
      toast.error(error.message || 'Sao lưu thất bại')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <AuthForm
            showLogin={showLogin}
            onToggle={() => setShowLogin(!showLogin)}
            onLogin={handleLogin}
            onRegister={handleRegister}
            loading={loading}
          />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎴</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Game Xâm Online</h1>
                <p className="text-sm text-white/80">Xin chào, {user?.username}</p>
              </div>
            </motion.div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackup}
                disabled={loading}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Shield size={18} />
                Sao lưu
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <LogOut size={18} />
                Đăng xuất
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Currency Wallet */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <CurrencyWallet
            balance={balance}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
          />
        </motion.div>

        {currentGame ? (
          <SamGameBoard
            game={currentGame}
            userId={user?.id}
            onPlay={async (cardIndices, playType) => {
              try {
                const result = await api.playCards(currentGame.id, cardIndices, playType)
                if (result.game_state) {
                  setCurrentGame({ id: currentGame.id, ...result.game_state })
                }
                if (result.result?.game_over) {
                  toast.success(result.result.winner === user?.id ? 'Bạn đã thắng!' : 'Game kết thúc!')
                }
              } catch (error: any) {
                toast.error(error.message || 'Không thể đánh bài')
              }
            }}
            onPass={async () => {
              try {
                const result = await api.passTurn(currentGame.id)
                if (result.game_state) {
                  setCurrentGame({ id: currentGame.id, ...result.game_state })
                }
              } catch (error: any) {
                toast.error(error.message || 'Không thể bỏ lượt')
              }
            }}
            onDeclareSam={async () => {
              try {
                const result = await api.declareSam(currentGame.id)
                if (result.game_state) {
                  setCurrentGame({ id: currentGame.id, ...result.game_state })
                }
              } catch (error: any) {
                toast.error(error.message || 'Không thể hô Sâm')
              }
            }}
            onStart={async () => {
              try {
                await api.startGame(currentGame.id)
                const gameState = await api.getGameState(currentGame.id)
                setCurrentGame({ id: currentGame.id, ...gameState.game_state })
                toast.success('Game đã bắt đầu!')
              } catch (error: any) {
                toast.error(error.message || 'Không thể bắt đầu game')
              }
            }}
            onLeave={() => {
              setCurrentGame(null)
              loadGames()
            }}
          />
        ) : (
          <div className="space-y-8">
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <StatsCard
                icon={<Trophy className="w-6 h-6" />}
                label="Số ván thắng"
                value={user?.stats?.games_won || 0}
                color="text-yellow-400"
              />
              <StatsCard
                icon={<Play className="w-6 h-6" />}
                label="Số ván đã chơi"
                value={user?.stats?.games_played || 0}
                color="text-blue-400"
              />
              <StatsCard
                icon={<TrendingUp className="w-6 h-6" />}
                label="Tỷ lệ thắng"
                value={`${user?.stats?.win_rate || 0}%`}
                color="text-green-400"
              />
              <StatsCard
                icon={<Coins className="w-6 h-6" />}
                label="Tổng chip"
                value={user?.stats?.total_chips || 0}
                color="text-purple-400"
              />
            </motion.div>

            {/* AI Game Mode */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <AIGameMode
                onCreateAIGame={handleCreateAIGame}
                balance={balance}
              />
            </motion.div>

            {/* Game List */}
            <GameList
              games={games}
              onCreateGame={handleCreateGame}
              onJoinGame={handleJoinGame}
              onRefresh={loadGames}
              loading={loading}
              balance={balance}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function AuthForm({ showLogin, onToggle, onLogin, onRegister, loading }: any) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (showLogin) {
      onLogin(username, password)
    } else {
      onRegister(username, password, email)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-2xl p-8"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <span className="text-4xl">🎴</span>
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {showLogin ? 'Đăng nhập' : 'Đăng ký'}
        </h2>
        <p className="text-gray-600">
          {showLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên đăng nhập
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="Nhập tên đăng nhập"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mật khẩu
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="Nhập mật khẩu"
          />
        </div>

        {!showLogin && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (tùy chọn)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Nhập email"
            />
          </motion.div>
        )}

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : showLogin ? (
            <>
              <LogIn className="w-5 h-5" />
              Đăng nhập
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              Đăng ký
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onToggle}
          className="text-purple-600 hover:text-purple-700 font-medium"
        >
          {showLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
        </button>
      </div>
    </motion.div>
  )
}
