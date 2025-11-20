'use client'

import { motion } from 'framer-motion'
import { Bot, Users, Play, Coins } from 'lucide-react'
import { useState } from 'react'

interface AIGameModeProps {
  onCreateAIGame: (betAmount: number, difficulty: string) => Promise<void>
  balance: number
}

export default function AIGameMode({ onCreateAIGame, balance }: AIGameModeProps) {
  const [showModal, setShowModal] = useState(false)
  const [betAmount, setBetAmount] = useState('1000')
  const [difficulty, setDifficulty] = useState('medium')

  const handleCreate = async () => {
    const amount = parseInt(betAmount)
    if (isNaN(amount) || amount <= 0) {
      return
    }
    if (amount > balance) {
      return
    }
    await onCreateAIGame(amount, difficulty)
    setShowModal(false)
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 shadow-xl cursor-pointer border-2 border-white/20"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Chơi với Máy</h3>
            <p className="text-white/80">Đấu với AI Bot</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/90">
          <Users className="w-5 h-5" />
          <span>1 người chơi + 3 AI</span>
        </div>
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold mb-4">Tạo game với AI</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức cược (chip)
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                min="100"
                step="100"
              />
              <div className="flex gap-2 mt-2">
                {[1000, 5000, 10000, 50000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setBetAmount(val.toString())}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      betAmount === val.toString()
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Độ khó AI
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'easy', label: 'Dễ', color: 'green' },
                  { value: 'medium', label: 'Trung bình', color: 'yellow' },
                  { value: 'hard', label: 'Khó', color: 'red' }
                ].map((diff) => (
                  <button
                    key={diff.value}
                    onClick={() => setDifficulty(diff.value)}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      difficulty === diff.value
                        ? `bg-${diff.color}-500 text-white scale-105`
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                disabled={parseInt(betAmount) > balance}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Bắt đầu
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
