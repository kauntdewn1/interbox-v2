import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface DropdownOption {
  id: string
  label: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> | string
}

interface DropdownSelectorProps {
  options: DropdownOption[]
  selectedOption: string
  onOptionChange: (optionId: string) => void
  className?: string
  placeholder?: string
}

export function DropdownSelector({ 
  options, 
  selectedOption, 
  onOptionChange, 
  className = '',
  placeholder = 'Selecione uma opção'
}: DropdownSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOptionData = options.find(opt => opt.id === selectedOption)

  const handleOptionClick = (optionId: string) => {
    onOptionChange(optionId)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 🎯 Trigger Button - Neon Pink com Desfoque */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-pink-500/20 backdrop-blur-xl border-2 border-pink-400/50 rounded-2xl px-6 py-4 text-left flex items-center justify-between hover:bg-pink-500/30 transition-all duration-200 shadow-lg shadow-pink-500/25"
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.01 }}
        style={{
          boxShadow: '0 0 20px rgba(236, 72, 153, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Opção Selecionada */}
        <div className="flex items-center gap-3">
          {selectedOptionData?.icon && (
            <div className="flex items-center justify-center w-6 h-6">
              {typeof selectedOptionData.icon === 'string' ? (
                <span className="text-lg">{selectedOptionData.icon}</span>
              ) : (
                <selectedOptionData.icon className="w-6 h-6 text-white" />
              )}
            </div>
          )}
          <span className="text-white font-medium">
            {selectedOptionData?.label || placeholder}
          </span>
        </div>

        {/* Ícone de Seta */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-white/70" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white/70" />
          )}
        </motion.div>
      </motion.button>

      {/* 🍎 Dropdown Menu - iOS Style com Animações */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="py-2">
              {options.map((option) => {
                const isSelected = option.id === selectedOption
                
                return (
                  <motion.button
                    key={option.id}
                    onClick={() => handleOptionClick(option.id)}
                    className={`
                      w-full flex items-center gap-3 px-6 py-4 text-left transition-all duration-200
                      ${isSelected 
                        ? 'bg-white/20 text-white' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }
                    `}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Ícone da Opção */}
                    {option.icon && (
                      <div className="flex items-center justify-center w-6 h-6">
                        {typeof option.icon === 'string' ? (
                          <span className="text-lg">{option.icon}</span>
                        ) : (
                          <option.icon className="w-6 h-6" />
                        )}
                      </div>
                    )}
                    
                    {/* Label da Opção */}
                    <span className="font-medium">{option.label}</span>
                    
                    {/* Indicador de Seleção */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
