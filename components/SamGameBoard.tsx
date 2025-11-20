'use client'

import { motion } from 'framer-motion'
import { X, Play, Zap, Shield, TrendingUp, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface SamGameBoardProps {
  game: any
  userId: number
  onPlay: (cardIndices: number[], playType: string) => Promise<void>
  onPass: () => Promise<void>
  onDeclareSam: () => Promise<void>
  onStart: () => Promise<void>
  onLeave: () => void
}

export default function SamGameBoard({ 
  game, 
  userId, 
  onPlay, 
  onPass, 
  onDeclareSam, 
  onStart, 
  onLeave 
}: SamGameBoardProps) {
  const [gameState, setGameState] = useState(game)
  const [selectedCards, setSelectedCards] = useState<number[]>([])
  const [playType, setPlayType] = useState<string>('single')

  useEffect(() => {
    setGameState(game)
  }, [game])

  const myHand = gameState.my_hand || []
  const isMyTurn = gameState.game_started && 
    !gameState.game_over && 
    gameState.players[gameState.current_player] === userId
  const canDeclareSam = gameState.game_started && !gameState.sam_declared && !gameState.game_over
  const samDeclared = gameState.sam_declared
  const isWinner = gameState.winner === userId

  const toggleCard = (index: number) => {
    if (!isMyTurn) return
    
    if (selectedCards.includes(index)) {
      setSelectedCards(selectedCards.filter(i => i !== index))
    } else {
      setSelectedCards([...selectedCards, index])
    }
  }

  const handlePlay = async () => {
    if (selectedCards.length === 0) {
      toast.error('Vui lòng chọn bài để đánh')
      return
    }

    try {
      await onPlay(selectedCards, playType)
      setSelectedCards([])
    } catch (error: any) {
      toast.error(error.message || 'Không thể đánh bài')
    }
  }

  const handleDeclareSam = async () => {
    if (!confirm('Bạn có chắc muốn hô Sâm? Nếu bị chặn sẽ thua nặng!')) {
      return
    }

    try {
      await onDeclareSam()
      toast.success('Đã hô Sâm! Bạn phải đánh hết bài!')
    } catch (error: any) {
      toast.error(error.message || 'Không thể hô Sâm')
    }
  }

  const getCardDisplay = (card: string) => {
    const [rank, suit] = card.split('')
    const isRed = suit === 'H' || suit === 'D'
    const suitSymbols: { [key: string]: string } = {
      'H': '♥',
      'D': '♦',
      'C': '♣',
      'S': '♠'
    }
    
    return {
      rank,
      suit: suitSymbols[suit] || suit,
      isRed
    }
  }

  const detectPlayType = (indices: number[]): string => {
    if (indices.length === 0) return 'single'
    if (indices.length === 1) return 'single'
    if (indices.length === 2) return 'pair'
    if (indices.length === 4) return 'four_of_kind'
    if (indices.length === 6) return 'three_pairs'
    if (indices.length >= 3) return 'straight'
    return 'single'
  }

  useEffect(() => {
    if (selectedCards.length > 0) {
      setPlayType(detectPlayType(selectedCards))
    }
  }, [selectedCards])

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-white"
        >
          Phòng #{game.id} - Sâm Lốc
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

      {/* Sâm Alert */}
      {samDeclared && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-red-500/20 border-2 border-red-500 rounded-lg p-4 mb-6 text-center"
        >
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-200 font-bold text-xl">
            ⚠️ SÂM ĐÃ ĐƯỢC HÔ! ⚠️
          </p>
          <p className="text-red-300 mt-2">
            Người chơi {gameState.sam_player} đã hô Sâm. Phải chặn được!
          </p>
        </motion.div>
      )}

      {/* Game Status */}
      {!gameState.game_started && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6 text-center"
        >
          <p className="text-yellow-200 font-semibold">
            Đang chờ người chơi... ({gameState.players?.length || 0} người)
          </p>
          {gameState.players?.[0] === userId && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              disabled={(gameState.players?.length || 0) < 2}
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

      {/* Last Play */}
      {gameState.last_play && gameState.last_play.cards && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-6 border-2 border-blue-400">
          <p className="text-white/80 mb-2">Lượt đánh trước:</p>
          <div className="flex gap-2">
            {gameState.last_play.cards.map((card: string, idx: number) => {
              const { rank, suit, isRed } = getCardDisplay(card)
              return (
                <div
                  key={idx}
                  className={`w-12 h-16 rounded border-2 flex flex-col items-center justify-center ${
                    isRed ? 'bg-white text-red-600' : 'bg-white text-gray-800'
                  }`}
                >
                  <div className="text-sm font-bold">{rank}</div>
                  <div className="text-lg">{suit}</div>
                </div>
              )
            })}
          </div>
          <p className="text-white/60 text-sm mt-2">
            Loại: {gameState.last_play.type} | Người đánh: {gameState.last_player}
          </p>
        </div>
      )}

      {/* Players Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {gameState.players?.map((playerId: number, index: number) => {
          const isMe = playerId === userId
          const isCurrent = gameState.current_player === index
          const cardsCount = gameState.player_hands?.[playerId] || 0
          
          return (
            <motion.div
              key={playerId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white/10 backdrop-blur-md rounded-xl p-4 border-2 ${
                isMe ? 'border-yellow-400 glow' : 
                isCurrent ? 'border-blue-400 glow' : 
                'border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white text-sm">
                  {isMe ? 'Bạn' : `Người ${playerId}`}
                </h3>
                {isCurrent && gameState.game_started && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-3 h-3 bg-blue-400 rounded-full"
                  />
                )}
              </div>
              <div className="text-2xl font-bold text-white text-center">
                {isMe ? myHand.length : cardsCount}
              </div>
              <div className="text-xs text-white/70 text-center">
                {playerId < 0 ? '🤖 AI' : 'lá bài'}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* My Hand */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border-2 border-yellow-400">
        <h3 className="text-xl font-bold text-white mb-4">Bài của bạn ({myHand.length} lá)</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {myHand.map((card: string, index: number) => {
            const { rank, suit, isRed } = getCardDisplay(card)
            const isSelected = selectedCards.includes(index)
            
            return (
              <motion.button
                key={index}
                whileHover={isMyTurn ? { scale: 1.1, y: -5 } : {}}
                whileTap={isMyTurn ? { scale: 0.95 } : {}}
                onClick={() => isMyTurn && toggleCard(index)}
                disabled={!isMyTurn}
                className={`w-16 h-24 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                  isSelected 
                    ? 'bg-yellow-400 border-yellow-500 scale-110 shadow-lg' 
                    : isMyTurn
                    ? 'bg-white hover:bg-gray-100 border-gray-300 cursor-pointer'
                    : 'bg-white border-gray-300 opacity-50'
                } ${isRed ? 'text-red-600' : 'text-gray-800'}`}
              >
                <div className="text-lg font-bold">{rank}</div>
                <div className="text-2xl">{suit}</div>
              </motion.button>
            )
          })}
        </div>

        {/* Play Type Indicator */}
        {selectedCards.length > 0 && (
          <div className="mb-4">
            <p className="text-white/80 mb-2">Loại bài đã chọn:</p>
            <div className="flex gap-2">
              {['single', 'pair', 'straight', 'four_of_kind', 'three_pairs'].map((type) => (
                <button
                  key={type}
                  onClick={() => setPlayType(type)}
                  className={`px-3 py-1 rounded ${
                    playType === type 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-white/20 text-white/70'
                  }`}
                >
                  {type === 'single' ? 'Rác' :
                   type === 'pair' ? 'Đôi' :
                   type === 'straight' ? 'Sảnh' :
                   type === 'four_of_kind' ? 'Tứ quý' :
                   '3 đôi thông'}
                </button>
              ))}
            </div>
          </div>
        )}
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
              onClick={handlePlay}
              disabled={selectedCards.length === 0}
              className="px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Zap size={20} />
              Đánh bài
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPass}
              className="px-6 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Shield size={20} />
              Bỏ lượt
            </motion.button>
            {canDeclareSam && (
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDeclareSam}
                className="px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                <AlertCircle size={20} />
                Hô Sâm
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
