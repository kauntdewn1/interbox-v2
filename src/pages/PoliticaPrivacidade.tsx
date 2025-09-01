import Header from '../components/Header'
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';

export default function PoliticaPrivacidade() {
  return (
    <>
      <SEOHead 
        title="Política de Privacidade - CERRADO INTERBØX 2025" 
        description="Política de privacidade e proteção de dados do CERRADO INTERBØX 2025." 
      />
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white py-12 px-4 pt-24">
        <div className="max-w-3xl mx-auto bg-black/60 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-pink-500/20">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            🔒 Política de Privacidade
          </h1>
          <h2 className="text-xl font-semibold mb-2 text-center">CERRADO INTERBØX 2025</h2>
          <p className="text-center text-sm text-gray-300 mb-6">
            Última atualização: 27/01/2025
          </p>
          <hr className="border-gray-700 mb-6" />

          <h3 className="text-lg font-bold mb-2 text-pink-400">1. 📋 Informações Coletadas</h3>
          <ul className="mb-4 list-disc pl-6 text-gray-200 space-y-2">
            <li><b>Dados pessoais:</b> nome completo, CPF, data de nascimento, telefone, email</li>
            <li><b>Dados de inscrição:</b> categoria, time, academia, informações de pagamento</li>
            <li><b>Dados de uso:</b> logs de acesso, interações com o site, preferências</li>
            <li><b>Dados de imagem:</b> fotos e vídeos durante o evento</li>
          </ul>

          <h3 className="text-lg font-bold mb-2 text-pink-400">2. 🎯 Finalidade do Tratamento</h3>
          <ul className="mb-4 list-disc pl-6 text-gray-200 space-y-2">
            <li>Processamento de inscrições e pagamentos</li>
            <li>Comunicação sobre o evento e atualizações</li>
            <li>Divulgação do evento em materiais promocionais</li>
            <li>Melhoria da experiência do usuário</li>
            <li>Cumprimento de obrigações legais</li>
          </ul>

          <h3 className="text-lg font-bold mb-2 text-pink-400">3. 🔐 Segurança dos Dados</h3>
          <ul className="mb-4 list-disc pl-6 text-gray-200 space-y-2">
            <li>Utilizamos <b>Supabase</b> para armazenamento seguro</li>
            <li>Dados criptografados em trânsito e em repouso</li>
            <li>Acesso restrito apenas a pessoal autorizado</li>
            <li>Monitoramento contínuo de segurança</li>
          </ul>

          <h3 className="text-lg font-bold mb-2 text-pink-400">4. 📤 Compartilhamento de Dados</h3>
          <ul className="mb-4 list-disc pl-6 text-gray-200 space-y-2">
                          <li><b>Supabase:</b> armazenamento de dados</li>
            <li><b>FlowPay:</b> processamento de pagamentos</li>
            <li><b>Parceiros do evento:</b> apenas dados necessários para organização</li>
            <li><b>Autoridades:</b> quando exigido por lei</li>
          </ul>

          <h3 className="text-lg font-bold mb-2 text-pink-400">5. ⏰ Retenção de Dados</h3>
          <ul className="mb-4 list-disc pl-6 text-gray-200 space-y-2">
            <li><b>Dados de inscrição:</b> mantidos por 5 anos para fins fiscais</li>
            <li><b>Dados de imagem:</b> mantidos indefinidamente para divulgação</li>
            <li><b>Dados de uso:</b> mantidos por 2 anos para análise</li>
            <li>Exclusão automática após os prazos estabelecidos</li>
          </ul>

          <h3 className="text-lg font-bold mb-2 text-pink-400">6. 🛡️ Seus Direitos</h3>
          <ul className="mb-4 list-disc pl-6 text-gray-200 space-y-2">
            <li><b>Acesso:</b> solicitar cópia dos seus dados</li>
            <li><b>Correção:</b> atualizar informações incorretas</li>
            <li><b>Exclusão:</b> solicitar remoção de dados pessoais</li>
            <li><b>Portabilidade:</b> receber dados em formato estruturado</li>
            <li><b>Revogação:</b> retirar consentimento a qualquer momento</li>
          </ul>

          <h3 className="text-lg font-bold mb-2 text-pink-400">7. 🍪 Cookies e Tecnologias</h3>
          <ul className="mb-4 list-disc pl-6 text-gray-200 space-y-2">
            <li><b>Cookies essenciais:</b> para funcionamento do site</li>
            <li><b>Cookies de análise:</b> Google Analytics (anônimo)</li>
            <li><b>Cookies de marketing:</b> apenas com consentimento</li>
            <li>Você pode desabilitar cookies nas configurações do navegador</li>
          </ul>

          <h3 className="text-lg font-bold mb-2 text-pink-400">8. 📱 Redes Sociais</h3>
          <ul className="mb-4 list-disc pl-6 text-gray-200 space-y-2">
            <li>Instagram: <a href="https://www.instagram.com/cerradointerbox" className="underline text-pink-400 hover:text-pink-300 transition-colors" target="_blank" rel="noopener noreferrer">@cerradointerbox</a></li>
            <li>WhatsApp: <a href="https://chat.whatsapp.com/FHTqm0l36kc7RWYWMw1Kiz" className="underline text-pink-400 hover:text-pink-300 transition-colors" target="_blank" rel="noopener noreferrer">Comunidade oficial</a></li>
            <li>Dados compartilhados seguem as políticas das respectivas plataformas</li>
          </ul>

          <h3 className="text-lg font-bold mb-2 text-pink-400">9. 📞 Contato</h3>
          <ul className="mb-4 list-disc pl-6 text-gray-200 space-y-2">
            <li><b>Email:</b> cerradointerbox@gmail.com</li>
            <li><b>Instagram:</b> @cerradointerbox</li>
            <li><b>WhatsApp:</b> Comunidade oficial do evento</li>
            <li>Respondemos solicitações em até 30 dias</li>
          </ul>

          <h3 className="text-lg font-bold mb-2 text-pink-400">10. ⚖️ Base Legal</h3>
          <ul className="mb-4 list-disc pl-6 text-gray-200 space-y-2">
            <li><b>Consentimento:</b> para uso de imagem e marketing</li>
            <li><b>Execução de contrato:</b> para processamento de inscrições</li>
            <li><b>Interesse legítimo:</b> para melhorias e segurança</li>
            <li><b>Obrigação legal:</b> para fins fiscais e regulatórios</li>
          </ul>

          <h3 className="text-lg font-bold mb-2 text-pink-400">11. 🔄 Alterações</h3>
          <ul className="mb-4 list-disc pl-6 text-gray-200 space-y-2">
            <li>Esta política pode ser atualizada periodicamente</li>
            <li>Alterações significativas serão comunicadas por email</li>
            <li>Data da última atualização sempre visível no topo</li>
            <li>Continuar usando o site significa aceitar as alterações</li>
          </ul>

          <h3 className="text-lg font-bold mb-2 text-pink-400">12. ✅ Aceite</h3>
          <blockquote className="border-l-4 border-pink-500 pl-4 italic text-pink-200 bg-pink-900/10 py-2 rounded-r">
            Ao usar nosso site e participar do evento, você concorda com esta Política de Privacidade. Se não concordar, não use nossos serviços.
          </blockquote>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Para dúvidas sobre esta política, entre em contato conosco.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 