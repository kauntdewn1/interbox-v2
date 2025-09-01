import { useState } from 'react'
import { motion } from 'framer-motion'

interface Tab {
  id: string
  label: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> | string
}

interface TabsProps {
  tabs: Tab[]
  defaultTab: string
  className?: string
  onTabChange: (tabId: string) => void
}

export function Tabs({ tabs, defaultTab, className = '', onTabChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    onTabChange(tabId)
  }

  return (
    <div className={`${className}`}>
      {/* 🍎 Container iOS Style - Espaçoso e Elegante */}
      <div className="bg-black/20 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl p-2">
        <div className="flex items-center justify-between gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  relative flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl
                  font-medium text-sm transition-all duration-300 ease-out
                  ${isActive 
                    ? 'bg-white text-black shadow-lg shadow-black/20' 
                    : 'text-white/70 hover:text-white/90 hover:bg-white/5'
                  }
                `}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.02 }}
                layout
              >
                {/* Ícone da Tab */}
                <div className="flex items-center justify-center w-5 h-5">
                  {typeof tab.icon === 'string' ? (
                    <span className="text-lg">{tab.icon}</span>
                  ) : tab.icon ? (
                    <tab.icon className="w-5 h-5" />
                  ) : null}
                </div>
                
                {/* Label da Tab */}
                <span className="whitespace-nowrap">{tab.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
