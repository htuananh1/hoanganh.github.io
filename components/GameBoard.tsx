'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Zap, Shield, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface GameBoardProps {
  game: any
  userId: number
  onAction: (action: string) => Promise<void>
  onStart: () => Promise<void>
  onLeave: () => void
}

export default function GameBoard({ game, userId, onAction, onStart, onLeave }: GameBoardProps) {
  const [gameState, setGameState] = useState(game)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  useEffect(() => {
    setGameState(game)
  }, [game])

  const isMyTurn = gameState.game_started && 
    !gameState.game_over && 
    gameState.players[gameState.current_player] === userId

  const myPlayerIndex = gameState.players.indexOf(userId)
  const myScore = myPlayerIndex >= 0 ? gameState.player_scores[gameState.players[myPlayerIndex]] : null
  const isWinner = gameState.winners?.includes(userId)

  const handleAction = async (action: string) => {
    setSelectedAction(action)
    try {
      await onAction(action)
    } catch (error) {
      // Error handled by parent
    } finally {
      setSelectedAction(null)
    }
  }

  const renderCard = (card: string, index: number, isHidden: boolean) => {
    if (isHidden || card === '?') {
      return (
        <motion.div
          key={index}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: 180 }}
          className="w-16 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gray-700 flex items-center justify-center shadow-lg"
        >
          <span className="text-2xl text-white">?</span>
        </motion.div>
      )
    }

    // Parse card format (e.g., "AH", "10D", "KS")
    const match = card.match(/^([A2-9JQK]|10)([HDCS])$/)
    if (!match) {
      // Fallback for unknown format
      return (
        <div className="w-16 h-24 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center shadow-lg">
          <span className="text-sm">{card}</span>
        </div>
      )
    }
    
    const [, rank, suit] = match
    const isRed = suit === 'H' || suit === 'D'
    
    return (
      <motion.div
        key={index}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`w-16 h-24 rounded-lg border-2 flex flex-col items-center justify-center shadow-lg ${
          isRed ? 'bg-white text-red-600 border-red-300' : 'bg-white text-gray-800 border-gray-300'
        }`}
      >
        <div className="text-xl font-bold">{rank}</div>
        <div className="text-2xl">{getSuitSymbol(suit)}</div>
      </motion.div>
    )
  }

  const getSuitSymbol = (suit: string) => {
    const suits: { [key: string]: string } = {
      'H': '♥',
      'D': '♦',
      'C': '♣',
      'S': '♠'
    }
    return suits[suit] || suit
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-white"
        >
          Phòng #{game.id}
        </motion.h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLeave}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <X size={20} />
          Rời phòng
        </motion.button>
      </div>

      {/* Game Status */}
      {!gameState.game_started && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6 text-center"
        >
          <p className="text-yellow-200 font-semibold">
            Đang chờ người chơi... ({gameState.players.length} người)
          </p>
          {gameState.players[0] === userId && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              disabled={gameState.players.length < 2}
              className="mt-4 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              <Play size={20} />
              Bắt đầu game
            </motion.button>
          )}
        </motion.div>
      )}

      {gameState.game_over && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-green-500/20 border border-green-500/50 rounded-lg p-6 mb-6 text-center"
        >
          <h3 className="text-2xl font-bold text-green-200 mb-2">Game kết thúc!</h3>
          {isWinner && (
            <p className="text-yellow-300 text-xl font-semibold">🎉 Bạn đã thắng! 🎉</p>
          )}
        </motion.div>
      )}

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {gameState.players.map((playerId: number, index: number) => {
          const isMe = playerId === userId
          const isCurrent = gameState.current_player === index
          const isPlayerWinner = gameState.winners?.includes(playerId)
          const cards = gameState.player_cards[playerId] || []
          const score = gameState.player_scores[playerId] || 0

          return (
            <motion.div
              key={playerId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border-2 transition-all ${
                isMe ? 'border-yellow-400 glow' : 
                isCurrent ? 'border-blue-400 glow' : 
                isPlayerWinner ? 'border-green-400 glow-green' : 
                'border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">
                  {isMe ? 'Bạn' : `Người chơi ${playerId}`}
                </h3>
                {isCurrent && gameState.game_started && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-3 h-3 bg-blue-400 rounded-full"
                  />
                )}
                {isPlayerWinner && (
                  <span className="text-2xl">🏆</span>
                )}
              </div>

              {/* Cards */}
              <div className="flex gap-2 mb-4 justify-center">
                {cards.map((card: string, cardIndex: number) =>
                  renderCard(card, cardIndex, !isMe && gameState.game_started && !gameState.game_over)
                )}
              </div>

              {/* Score */}
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{score}</div>
                <div className="text-sm text-white/70">Điểm</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Actions */}
      {isMyTurn && gameState.game_started && !gameState.game_over && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border-2 border-yellow-400"
        >
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            Lượt của bạn - Chọn hành động:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction('hit')}
              disabled={selectedAction !== null}
              className="px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Zap size={20} />
              Rút bài
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction('stand')}
              disabled={selectedAction !== null}
              className="px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Shield size={20} />
              Dừng
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction('double')}
              disabled={selectedAction !== null}
              className="px-6 py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <TrendingUp size={20} />
              Gấp đôi
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* My Score Display */}
      {myScore !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center"
        >
          <div className="inline-block bg-white/20 backdrop-blur-md rounded-lg px-6 py-3">
            <div className="text-sm text-white/80 mb-1">Điểm của bạn</div>
            <div className="text-4xl font-bold text-white">{myScore}</div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
