import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

function PainelAprovacaoUsuarios() {
  const [usuariosPendentes, setUsuariosPendentes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Busca os usuários pendentes (GET /api/usuarios/pendentes)
  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/usuarios/pendentes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsuariosPendentes(data);
      } else {
        toast.error(`Erro ${response.status}: Não foi possível carregar as pendências.`);
      }
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      toast.error('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const handleAprovar = async (id, aprovar) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = aprovar 
        ? `${import.meta.env.VITE_API_BASE_URL}/usuarios/${id}/aprovar`
        : `${import.meta.env.VITE_API_BASE_URL}/usuarios/${id}/bloquear`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const mensagem = await response.text();
        toast.success(mensagem);
        carregarUsuarios(); // Atualiza a tabela
      } else {
        toast.error(`Erro ${response.status}: Falha ao processar solicitação.`);
      }
    } catch (err) {
      toast.error('Erro de conexão com o servidor.');
    }
  };

  if (loading) {
    return <div style={{ color: '#e5e7eb', textAlign: 'center', padding: '40px' }}>Carregando solicitações...</div>;
  }

  return (
    <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', padding: '24px', border: '1px solid #374151' }}>
      <h2 style={{ color: '#e5e7eb', marginTop: 0, marginBottom: '20px' }}>Aprovação de Novos Usuários</h2>

      {usuariosPendentes.length === 0 ? (
        <p style={{ color: '#9ca3af' }}>Nenhum usuário aguardando aprovação no momento.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#e5e7eb' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af' }}>
              <th style={{ padding: '12px' }}>Nome</th>
              <th style={{ padding: '12px' }}>E-mail</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuariosPendentes.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #374151' }}>
                <td style={{ padding: '12px' }}>{u.nomeCompleto || u.nome || 'Pendente'}</td>
                <td style={{ padding: '12px' }}>{u.email}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleAprovar(u.id, true)}
                    style={{
                      backgroundColor: '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      marginRight: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleAprovar(u.id, false)}
                    style={{
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      cursor: 'pointer'
                    }}
                  >
                    Bloquear
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PainelAprovacaoUsuarios;