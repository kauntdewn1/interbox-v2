export default function Footer() {
  return (
    <footer className="bg-black/80 border-t border-white/10 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="text-white/60 text-sm">
          <p>© 2025 INTERBØX — Todos os direitos reservados.</p>
          <p className="mt-2">
            Plataforma oficial de captação, inscrições e credenciamento do maior campeonato de times de CrossFit da América Latina.
          </p>
        </div>

        {/* Links úteis */}
        <div className="mt-6 flex justify-center space-x-6">
          <a 
            href="https://instagram.com/cerradointerbox" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition-colors"
          >
            📱 Instagram
          </a>
          <a 
            href="https://tiktok.com/@cerradointerbox" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition-colors"
          >
            🎵 TikTok
          </a>
          <a 
            href="mailto:cerradointerbox@gmail.com" 
            className="text-white/60 hover:text-white transition-colors"
          >
            📧 Contato
          </a>
        </div>
      </div>
    </footer>
  );
}
