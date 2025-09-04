import { IoLogoInstagram } from "react-icons/io";
import { PiTiktokLogoBold } from "react-icons/pi";

export default function Footer() {
  return (
    <footer className="bg-black/80 border-t border-white/10 py-8 mt-16 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="text-white/60 text-sm">
          <p>© 2025 INTERBØX — Todos os direitos reservados.</p>
          <p className="mt-2">
            Plataforma oficial de captação, inscrições e credenciamento do maior campeonato de times de CrossFit da América Latina.
          </p>
        </div>

        {/* Links úteis */}
        <div className="mt-6 flex justify-center space-x-50 mb-8 md:space-x-6">
          <a 
            href="https://instagram.com/cerradointerbox" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition-colors flex items-center space-x-2"
          >
            <IoLogoInstagram className="w-5 h-5" />
            <span> Instagram </span>
          </a>
          <a 
            href="https://tiktok.com/@cerradointerbox" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition-colors flex items-center space-x-2"
          >
            <PiTiktokLogoBold className="w-5 h-5" />
            <span> TikTok </span>
          </a>
          <a 
            href="https://drive.google.com/file/d/1wLnETYONkPjPWYjEd2dib9pEJFvvCsag/view?usp=sharing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition-colors flex items-center space-x-2"
          >
            <span>📋</span>
            <span> Regulamento </span>
          </a>
        </div>

        {/* Espaçamento extra para mobile */}
        <div className="h-16 md:hidden"></div>
      </div>
    </footer>
  );
}
