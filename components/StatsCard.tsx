'use client'

import { motion } from 'framer-motion'

interface StatsCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
}

export default function StatsCard({ icon, label, value, color }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border-2 border-white/20 hover:border-purple-400 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/70">{label}</div>
    </motion.div>
  )
}
