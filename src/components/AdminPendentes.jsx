import React, { useState, useEffect } from 'react';

export default function AdminPendentes({ onClose }) {
  const [pendentes, setPendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState('');

  // Carrega lista de pendentes ao abrir
  const carregarPendentes = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/usuarios/pendentes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPendentes(data);
      } else {
        setMensagem('Erro ao carregar lista de pendentes.');
      }
    } catch (err) {
      setMensagem('Falha ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPendentes();
  }, []);

  // Aprova um usuário pelo ID
  const handleAprovar = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/usuarios/${id}/aprovar`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setPendentes(pendentes.filter(u => u.id !== id));
      } else {
        alert('Erro ao aprovar usuário.');
      }
    } catch (err) {
      alert('Erro na requisição.');
    }
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.content}>
        <div style={modalStyles.header}>
          <h3>Aprovação de Usuários Pendentes</h3>
          <button onClick={onClose} style={modalStyles.closeBtn}>✕</button>
        </div>

        {mensagem && <p style={{ color: '#ef4444' }}>{mensagem}</p>}
        {loading ? (
          <p style={{ color: '#cbd5e1' }}>Carregando...</p>
        ) : pendentes.length === 0 ? (
          <p style={{ color: '#94a3b8', margin: '20px 0' }}>Nenhum usuário aguardando aprovação.</p>
        ) : (
          <table style={modalStyles.table}>
            <thead>
              <tr>
                <th style={modalStyles.th}>Nome</th>
                <th style={modalStyles.th}>E-mail</th>
                <th style={modalStyles.th}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {pendentes.map((u) => (
                <tr key={u.id}>
                  <td style={modalStyles.td}>{u.nomeCompleto}</td>
                  <td style={modalStyles.td}>{u.email}</td>
                  <td style={modalStyles.td}>
                    <button onClick={() => handleAprovar(u.id)} style={modalStyles.approveBtn}>
                      Aprovar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  content: {
    backgroundColor: '#1e293b',
    padding: '24px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '550px',
    border: '1px solid #334155',
    color: '#f8fafc',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid #334155',
    paddingBottom: '12px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '18px',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
  },
  th: {
    textAlign: 'left',
    padding: '8px',
    borderBottom: '1px solid #334155',
    color: '#94a3b8',
  },
  td: {
    padding: '10px 8px',
    borderBottom: '1px solid #334155',
    color: '#f8fafc',
  },
  approveBtn: {
    backgroundColor: '#22c55e',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  }
};