import { useState, useEffect, useRef } from 'react';
import { LuUser, LuShieldCheck } from "react-icons/lu"; // Ícones de Usuário e Admin
import { IoMdArrowDropdown } from "react-icons/io";
import { FiLogOut } from "react-icons/fi";

function UserMenu({ onLogout, onAbrirAdmin }) {
  const [aberto, setAberto] = useState(false);
  const menuRef = useRef(null);

  // 1. Recupera o usuário salvo no localStorage no momento do login
  const usuarioSalvo = JSON.parse(localStorage.getItem('usuario') || '{}');

  // 2. Verifica se o perfil/role do usuário é ADMIN
  const eAdmin = usuarioSalvo?.role === 'ADMIN' || 
                 usuarioSalvo?.role === 'ROLE_ADMIN' || 
                 usuarioSalvo?.perfil === 'ADMIN';

  // Fecha o menu se clicar fora dele
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Botão do Usuário */}
      <button 
        onClick={() => setAberto(!aberto)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#1f2937',
          color: '#e5e7eb',
          border: '1px solid #374151',
          borderRadius: '8px',
          padding: '8px 14px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
      >
        <LuUser size={20} color="#9ca3af" />
        <span>{usuarioSalvo?.nome || usuarioSalvo?.login || 'Minha Conta'}</span>
        <IoMdArrowDropdown 
          size={18} 
          style={{ 
            transform: aberto ? 'rotate(180deg)' : 'rotate(0deg)', 
            transition: 'transform 0.2s ease',
            color: '#9ca3af'
          }} 
        />
      </button>

      {/* Menu Dropdown */}
      {aberto && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '48px',
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
          width: '210px',
          zIndex: 100,
          overflow: 'hidden'
        }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #374151', fontSize: '12px', color: '#9ca3af' }}>
            {usuarioSalvo?.login ? `Conectado como ${usuarioSalvo.login}` : 'Sessão Ativa'}
          </div>

          {/* 3. OPÇÃO EXCLUSIVA DE ADMIN (Aparece apenas se eAdmin for true) */}
          {eAdmin && (
            <button 
              onClick={() => {
                setAberto(false);
                if (onAbrirAdmin) onAbrirAdmin();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                backgroundColor: 'transparent',
                color: '#3b82f6', // Cor Azul para destacar a função Admin
                border: 'none',
                borderBottom: '1px solid #374151',
                cursor: 'pointer',
                fontSize: '14px',
                textAlign: 'left',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <LuShieldCheck size={18} />
              Aprovar Usuários
            </button>
          )}

          {/* Opção de Sair */}
          <button 
            onClick={() => {
              setAberto(false);
              onLogout();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              backgroundColor: 'transparent',
              color: '#ef4444',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              textAlign: 'left',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FiLogOut size={16} />
            Sair da Conta
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;