import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserButton, SignInButton, SignedIn, SignedOut, useUser } from '@clerk/clerk-react'
import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user: authUser } = useUser()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fechar menu mobile quando a rota mudar
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    if (isMenuOpen) document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isMenuOpen])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${
          isScrolled
            ? 'bg-black/95 backdrop-blur-xl border-b border-pink-500/30 shadow-lg'
            : 'bg-black/70 backdrop-blur-md border-b border-pink-500/20'
        }`}
      >
        <motion.div
          className={`container mx-auto px-4 transition-all duration-300 ${
            isScrolled ? 'py-1' : 'py-2'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* LOGO */}
            <a href="/" className="flex items-center space-x-2 group">
              <motion.div
                className="relative overflow-hidden rounded-lg"
                animate={
                  !isScrolled
                    ? { scale: [1, 1.05, 1], opacity: [1, 0.95, 1] }
                    : {}
                }
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <img
                  src="/logos/nome_hrz.png"
                  alt="Interbox 2025"
                  className="transition-all duration-300"
                  style={{ width: isScrolled ? 50 : 70, height: 'auto' }}
                />
              </motion.div>
            </a>

            {/* NAV DESKTOP - APENAS LOGIN */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/links" className="text-pink-400 hover:text-pink-300 text-sm font-medium">
                Links
              </a>
              <SignedOut>
                <SignInButton mode="modal">
                  <motion.button
                    className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium text-sm transform"
                    animate={{ scale: [1, 1.05, 1], opacity: [1, 0.95, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.1 }}
                  >
                    Login
                  </motion.button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </nav>

            {/* BOTÃO MENU MOBILE */}
            <motion.button
              onClick={toggleMenu}
              className="md:hidden flex flex-col justify-center items-center w-7 h-7 text-white hover:text-pink-400 relative"
              whileTap={{ scale: 0.95 }}
              aria-label="Abrir menu"
              style={{ zIndex: 1001 }}
            >
              <motion.span
                className="absolute w-5 h-0.5 bg-current"
                animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 0 : -5 }}
                style={{ top: '50%', left: '50%', marginLeft: '-10px', marginTop: '-1px' }}
              />
              <motion.span
                className="absolute w-5 h-0.5 bg-current"
                animate={{ opacity: isMenuOpen ? 0 : 1, scale: isMenuOpen ? 0 : 1 }}
                style={{ top: '50%', left: '50%', marginLeft: '-10px', marginTop: '-1px' }}
              />
              <motion.span
                className="absolute w-5 h-0.5 bg-current"
                animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? 0 : 5 }}
                style={{ top: '50%', left: '50%', marginLeft: '-10px', marginTop: '-1px' }}
              />
            </motion.button>
          </div>
        </motion.div>
      </motion.header>

      {/* MENU MOBILE FULLSCREEN */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-lg z-30"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-0 right-0 w-4/5 max-w-xs h-full bg-black/95 border-l border-pink-500/30 shadow-lg z-40 flex flex-col p-6"
            >
              <h2 className="text-lg font-bold text-pink-400 mb-6">Menu</h2>
              <nav className="flex flex-col space-y-4">
                <p className="text-gray-400 text-sm mb-2">Navegação principal disponível no menu inferior</p>

                {authUser ? (
                  <>
                    <a
                      href="/perfil"
                      className="flex items-center space-x-3 text-pink-400 hover:text-pink-300 font-semibold text-lg py-3 px-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg border border-pink-500/20 hover:border-pink-400/40 transition-all duration-300"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">👤</span>
                      </div>
                      <span>Meu Perfil</span>
                    </a>
                    <div className="user-button-container">
                      <UserButton 
                        afterSignOutUrl="/" 
                        appearance={{
                          elements: {
                            userButtonPopoverCard: "hidden",
                            userButtonPopoverRootBox: "hidden",
                            userButtonPopoverActionButton: "hidden",
                            userButtonPopoverActions: "hidden"
                          }
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <SignInButton mode="modal">
                    <motion.button
                      className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-3 rounded-lg font-medium text-base text-center transform"
                      animate={{ scale: [1, 1.05, 1], opacity: [1, 0.95, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      whileHover={{ scale: 1.1 }}
                    >
                      Login
                    </motion.button>
                  </SignInButton>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
