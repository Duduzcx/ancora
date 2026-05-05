export default function Privacidade() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-800 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-black text-[#001f3f] mb-2">Política de Privacidade</h1>
        <p className="mb-8 text-sm text-slate-500 font-medium">Última atualização: Abril de 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="text-lg font-bold text-[#001f3f] mb-3">1. Introdução</h2>
            <p>A ZCX Studios, desenvolvedora do aplicativo Nórica, compromete-se a proteger a sua privacidade. Esta política detalha como coletamos, usamos e protegemos suas informações pessoais em nosso ecossistema de saúde mental.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#001f3f] mb-3">2. Coleta de Dados</h2>
            <p>Para fornecer o nosso sistema de navegação emocional, coletamos os seguintes dados:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>Dados de Autenticação:</strong> Nome, endereço de e-mail e foto de perfil, fornecidos pelo provedor de login (Google OAuth) no momento da criação da conta.</li>
              <li><strong>Dados de Interação:</strong> Informações fornecidas voluntariamente pelo usuário durante a interação com a nossa Inteligência Artificial (Bússola) para fins de triagem emocional.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#001f3f] mb-3">3. Uso das Informações</h2>
            <p>Seus dados são utilizados exclusivamente para as seguintes finalidades:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Gerenciar sua sessão e manter sua conta segura.</li>
              <li>Processar análises e gerar relatórios de triagem mental utilizando nossa tecnologia de IA.</li>
              <li>Facilitar o encaminhamento para profissionais de saúde especializados.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#001f3f] mb-3">4. Compartilhamento de Dados</h2>
            <p>A ZCX Studios não vende, aluga ou compartilha seus dados pessoais com terceiros para fins de marketing ou publicidade. O processamento de dados ocorre apenas por provedores de infraestrutura estritamente necessários (como banco de dados seguro e APIs de Inteligência Artificial), operando sob rigorosos padrões de segurança.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#001f3f] mb-3">5. Exclusão de Conta e Dados</h2>
            <p>O usuário possui o direito de solicitar a exclusão permanente de sua conta e de todos os dados associados a qualquer momento. Isso pode ser feito diretamente nas configurações do aplicativo ou entrando em contato com nosso suporte.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#001f3f] mb-3">6. Contato</h2>
            <p>Em caso de dúvidas sobre esta política ou sobre o tratamento de seus dados, entre em contato através dos canais oficiais da ZCX Studios.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
