'use client'

import { motion } from 'framer-motion'
import { Coins, Plus, Minus, Wallet, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface CurrencyWalletProps {
  balance: number
  onDeposit: (amount: number) => Promise<void>
  onWithdraw: (amount: number) => Promise<void>
}

export default function CurrencyWallet({ balance, onDeposit, onWithdraw }: CurrencyWalletProps) {
  const [showModal, setShowModal] = useState(false)
  const [isDeposit, setIsDeposit] = useState(true)
  const [amount, setAmount] = useState('')

  const handleSubmit = async () => {
    const numAmount = parseInt(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Số tiền không hợp lệ')
      return
    }

    try {
      if (isDeposit) {
        await onDeposit(numAmount)
        toast.success(`Đã nạp ${numAmount.toLocaleString()} chip!`)
      } else {
        if (numAmount > balance) {
          toast.error('Số dư không đủ')
          return
        }
        await onWithdraw(numAmount)
        toast.success(`Đã rút ${numAmount.toLocaleString()} chip!`)
      }
      setShowModal(false)
      setAmount('')
    } catch (error: any) {
      toast.error(error.message || 'Giao dịch thất bại')
    }
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-4 shadow-lg cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Số dư</p>
              <p className="text-white text-2xl font-bold">
                {balance.toLocaleString()} chip
              </p>
            </div>
          </div>
          <Wallet className="w-6 h-6 text-white/80" />
        </div>
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold mb-4">
              {isDeposit ? 'Nạp chip' : 'Rút chip'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tiền
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Nhập số tiền"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                min="1"
              />
            </div>

            <div className="flex gap-2 mb-4">
              {[1000, 5000, 10000, 50000].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val.toString())}
                  className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                >
                  {val.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsDeposit(!isDeposit)
                  setAmount('')
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                {isDeposit ? 'Chuyển sang Rút' : 'Chuyển sang Nạp'}
              </button>
              <button
                onClick={handleSubmit}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
                  isDeposit
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {isDeposit ? (
                  <>
                    <Plus className="w-4 h-4 inline mr-2" />
                    Nạp
                  </>
                ) : (
                  <>
                    <Minus className="w-4 h-4 inline mr-2" />
                    Rút
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => {
                setShowModal(false)
                setAmount('')
              }}
              className="w-full mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Hủy
            </button>
          </motion.div>
        </div>
      )}
    </>
  )
}
