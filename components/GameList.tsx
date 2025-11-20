'use client'

import { motion } from 'framer-motion'
import { Plus, RefreshCw, Users, Coins, Play } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface GameListProps {
  games: any[]
  onCreateGame: (betAmount: number) => Promise<void>
  onJoinGame: (gameId: number) => Promise<void>
  onRefresh: () => void
  loading: boolean
  balance: number
}

export default function GameList({ games, onCreateGame, onJoinGame, onRefresh, loading, balance }: GameListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [betAmount, setBetAmount] = useState('100')

  const handleCreate = async () => {
    const amount = parseInt(betAmount)
    if (isNaN(amount) || amount < 100) {
      toast.error('Số chip cược phải >= 100')
      return
    }
    if (amount > balance) {
      toast.error('Số dư không đủ!')
      return
    }
    await onCreateGame(amount)
    setShowCreateModal(false)
    setBetAmount('1000')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-white"
        >
          Danh sách phòng chơi
        </motion.h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg flex items-center gap-2 transition-all"
          >
            <Plus size={18} />
            Tạo phòng
          </motion.button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold mb-4">Tạo phòng mới</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số chip cược
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="100"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Tạo
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Games Grid */}
      {games.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-12 text-center border-2 border-white/20"
        >
          <Users size={48} className="mx-auto mb-4 text-white/50" />
          <p className="text-white/80 text-lg">Chưa có phòng nào. Hãy tạo phòng mới!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border-2 border-white/20 hover:border-purple-400 transition-all cursor-pointer"
              onClick={() => onJoinGame(game.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Phòng #{game.id}</h3>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold">
                  Đang chờ
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/80">
                  <Users size={18} />
                  <span>{game.players_count}/{game.max_players} người chơi</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Coins size={18} />
                  <span>{game.bet_amount} chip</span>
                </div>
                <div className="text-sm text-white/60">
                  Người tạo: {game.creator}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Play size={18} />
                Tham gia
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
