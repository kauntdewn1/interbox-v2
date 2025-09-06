import { FaInstagramSquare } from "react-icons/fa";
import { AiFillTikTok } from "react-icons/ai";
import { PiNotebookFill } from "react-icons/pi";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-black/80 border-t border-white/10 py-8 mt-16 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="text-white/60 text-sm">
          <p>© {currentYear} INTERBØX — Todos os direitos reservados.</p>
          <p className="mt-2">
            Plataforma oficial de captação, inscrições e credenciamento do maior campeonato de times de CrossFit da América Latina.
          </p>
        </div>

        {/* Links úteis */}
        <div className="mt-6 flex justify-center space-x-8 mb-8 md:space-x-6">
          <a 
            href="https://instagram.com/cerradointerbox" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/60 hover:text-pink-500 transition-colors flex items-center space-x-2 group"
          >
            <FaInstagramSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Instagram</span>
          </a>
          <a 
            href="https://tiktok.com/@cerradointerbox" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/60 hover:text-black hover:bg-white transition-all duration-300 flex items-center space-x-2 group rounded-lg px-2 py-1"
          >
            <AiFillTikTok className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="font-medium">TikTok</span>
          </a>
          <a 
            href="https://drive.google.com/file/d/1wLnETYONkPjPWYjEd2dib9pEJFvvCsag/view?usp=sharing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/60 hover:text-blue-400 transition-colors flex items-center space-x-2 group"
          >
            <PiNotebookFill className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Regulamento</span>
          </a>
        </div>
        <p className="mt-4 text-xs text-white/40">
            ↳ Desenvolvido sob o{' '}
            <a 
              href="https://wa.me/+5562983231110" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300 transition-colors font-medium"
            >
              NΞØ Protocol
            </a>
          </p>

        {/* Espaçamento extra para mobile */}
        <div className="h-16 md:hidden"></div>
      </div>
    </footer>
  );
}
