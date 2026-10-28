import { Toaster } from 'react-hot-toast';
import { useState, useEffect, useCallback } from 'react';
import FormularioItem from './components/FormularioItem';
import TabelaItens from './components/TabelaItens';
import PainelManutencoes from './components/PainelManutencoes';
import DashboardCards from './components/DashboardCards'; 
import UserMenu from './components/UserMenu';
import AuthPage from './components/AuthPage';
import PainelAprovacaoUsuarios from './components/PainelAprovacaoUsuarios';
import { CiViewTable } from "react-icons/ci";
import { MdOutlinePrecisionManufacturing } from "react-icons/md";

const TEMPO_INATIVIDADE_MS = 20 * 60 * 1000; // 20 Minutos

function App() {
  const [abaAtiva, setAbaAtiva] = useState('itens');
  const [triggerAtualizacao, setTriggerAtualizacao] = useState(0);

  // 1. PERSISTÊNCIA: Verifica no localStorage se já está logado ao carregar/recarregar
  const [estaLogado, setEstaLogado] = useState(() => {
    return localStorage.getItem('estaLogado') === 'true';
  });

  // Função central para efetuar Logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('estaLogado');
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setEstaLogado(false);
  }, []);

  // Função central para efetuar Login (Apenas ativa o estado sem sobrescrever o localStorage)
  const handleLogin = () => {
    localStorage.setItem('estaLogado', 'true');
    setEstaLogado(true);
  };

  // 2. INATIVIDADE: Monitora ações do usuário e desloga após 20 min sem interação
  useEffect(() => {
    if (!estaLogado) return;

    let timer;

    const resetarTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        alert('Sua sessão expirou por inatividade.');
        handleLogout();
      }, TEMPO_INATIVIDADE_MS);
    };

    const eventos = ['mousemove', 'keydown', 'click', 'scroll'];
    eventos.forEach(evento => window.addEventListener(evento, resetarTimer));

    resetarTimer();

    return () => {
      if (timer) clearTimeout(timer);
      eventos.forEach(evento => window.removeEventListener(evento, resetarTimer));
    };
  }, [estaLogado, handleLogout]);

  // Se NÃO estiver logado, mostra SÓ a tela de login
  if (!estaLogado) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <Toaster position="top-right" />
      
      {/* 3. CABEÇALHO COM USERMENU NO CANTO SUPERIOR DIREITO */}
      <header className="app-header">
        <h1 className="app-header-title">
          Sistema de Manutenção
        </h1>
        
        <UserMenu 
          onLogout={handleLogout} 
          onAbrirAdmin={() => setAbaAtiva('usuarios')} 
        />
      </header>
      
      <div className="app-content">
          
          {/* Carrossel no Topo */}
          <DashboardCards triggerAtualizacao={triggerAtualizacao} />
          
          <div className="gh-tabs-container">
            <button 
                className={abaAtiva === 'itens' ? 'gh-tab active' : 'gh-tab'} 
                onClick={() => setAbaAtiva('itens')}
            >
                <CiViewTable size={22} /> Inventário de Laboratório
            </button>
              
            <button 
              className={abaAtiva === 'manutencoes' ? 'gh-tab active' : 'gh-tab'} 
              onClick={() => setAbaAtiva('manutencoes')}
            >
              <MdOutlinePrecisionManufacturing size={22} /> Painel de Manutenções
            </button>
          </div>

          {/* Conteúdo da Aba */}
          <div className="tab-content-area">
            {abaAtiva === 'itens' && (
              <TabelaItens 
                triggerAtualizacao={triggerAtualizacao} 
                onAtualizou={() => setTriggerAtualizacao(prev => prev + 1)} 
              />
            )}

            {abaAtiva === 'manutencoes' && (
              <PainelManutencoes 
                triggerAtualizacao={triggerAtualizacao} 
                onAtualizou={() => setTriggerAtualizacao(prev => prev + 1)} 
              />
            )}

            {abaAtiva === 'usuarios' && (
              <PainelAprovacaoUsuarios />
            )}
          </div>

      </div>
    </div>
  );
}

export default App;