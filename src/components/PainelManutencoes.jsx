import { useState, useEffect } from 'react';
import api from '../services/api';
import ModalConcluirManutencao from './Modals/ModalConcluirManutencao';
import '../styles/App.css';

const PainelManutencoes = ({ triggerAtualizacao, onAtualizou }) => {
    const [manutencoes, setManutencoes] = useState([]);
    const [erro, setErro] = useState('');
    const [termoBuscaOficina, setTermoBuscaOficina] = useState('');
    
    // Estados do Modal de Conclusão
    const [modalConcluirAberto, setModalConcluirAberto] = useState(false);
    const [manutencaoSelecionada, setManutencaoSelecionada] = useState(null);

    const carregarManutencoes = () => {
        api.get('/manutencoes')
            .then(response => {
                // response.data já traz a manutenção com o item associado
                setManutencoes(response.data);
            })
            .catch(error => {
                console.error("Erro ao buscar manutenções:", error);
                setErro("Não foi possível carregar as manutenções.");
            });
    };

    useEffect(() => {
        carregarManutencoes();
    }, []);

    // Sincronização global sem precisar de F5
    useEffect(() => {
        carregarManutencoes();
    }, [triggerAtualizacao]);

    const handleConcluirClick = (manutencao) => {
        setManutencaoSelecionada(manutencao);
        setModalConcluirAberto(true);
    };

    const handleSuccess = () => {
        carregarManutencoes();
        if (onAtualizou) onAtualizou();
    };

    const alterarStatus = (id, novoStatus) => {
        api.put(`/manutencoes/${id}/status?novoStatus=${novoStatus}`)
            .then(() => {
                carregarManutencoes();
                if(onAtualizou) onAtualizou(); // Dispara a atualização global (Dashboard)
            })
            .catch(error => console.error("Erro ao alterar status:", error));
    };

    const formatarCusto = (custo) => {
        if (!custo || custo === 0) return '-';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(custo);
    };

    const renderStatus = (status) => {
        if (status === 'EM_ANDAMENTO') return <span className="badge-status badge-blue">Em Andamento</span>;
        if (status === 'CONCLUIDO') return <span className="badge-status badge-green">Concluído</span>;
        if (status === 'ESPERANDO_PECA') return <span className="badge-status badge-yellow">Aguardando Peça</span>;
        if (status === 'PARADO') return <span className="badge-status badge-red">Parado</span>;
        return <span className="badge-status">{status}</span>;
    };

    // Aplica o filtro: remove concluídos e depois filtra pela barra de busca
    const manutencoesFiltradas = manutencoes
        .filter(m => m.status !== 'CONCLUIDO')
        .filter(m => 
            m.item?.nome?.toLowerCase().includes(termoBuscaOficina.toLowerCase()) || 
            m.item?.patrimonio?.toLowerCase().includes(termoBuscaOficina.toLowerCase()) ||
            m.defeito?.toLowerCase().includes(termoBuscaOficina.toLowerCase())
        );

    return (
        <div style={{ padding: '20px', backgroundColor: '#1f2937', color: '#e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
            <h2 style={{ color: '#a1a1a1', marginTop: 0 }}>Painel de Manutenções</h2>
            <p style={{ color: '#666', fontSize: '1.1em', marginBottom: '20px' }}>Controle de consertos e itens em manutenção</p>
            
            {/* NOVA Barra de Busca da Oficina (Estilo Neon) */}
            <div className="custom-search-box" style={{ marginBottom: '20px', maxWidth: '600px' }}>
                <input 
                    type="text" 
                    placeholder="Buscar por equipamento, patrimônio ou defeito..." 
                    value={termoBuscaOficina}
                    onChange={(e) => setTermoBuscaOficina(e.target.value)}
                    className="custom-search-input"
                />
                <button className="custom-search-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 29 29" fill="none">
                        <g clipPath="url(#clip0_2_17)">
                            <g filter="url(#filter0_d_2_17)">
                                <path d="M23.7953 23.9182L19.0585 19.1814M19.0585 19.1814C19.8188 18.4211 20.4219 17.5185 20.8333 16.5251C21.2448 15.5318 21.4566 14.4671 21.4566 13.3919C21.4566 12.3167 21.2448 11.252 20.8333 10.2587C20.4219 9.2653 19.8188 8.36271 19.0585 7.60242C18.2982 6.84214 17.3956 6.23905 16.4022 5.82759C15.4089 5.41612 14.3442 5.20435 13.269 5.20435C12.1938 5.20435 11.1291 5.41612 10.1358 5.82759C9.1424 6.23905 8.23981 6.84214 7.47953 7.60242C5.94407 9.13789 5.08145 11.2204 5.08145 13.3919C5.08145 15.5634 5.94407 17.6459 7.47953 19.1814C9.01499 20.7168 11.0975 21.5794 13.269 21.5794C15.4405 21.5794 17.523 20.7168 19.0585 19.1814Z" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" shapeRendering="crispEdges" />
                            </g>
                        </g>
                        <defs>
                            <filter id="filter0_d_2_17" x="-0.418549" y="3.70435" width="29.7139" height="29.7139" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                <feFlood floodOpacity={0} result="BackgroundImageFix" />
                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                <feOffset dy={4} />
                                <feGaussianBlur stdDeviation={2} />
                                <feComposite in2="hardAlpha" operator="out" />
                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2_17" />
                                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2_17" result="shape" />
                            </filter>
                            <clipPath id="clip0_2_17">
                                <rect width="28.0702" height="28.0702" fill="white" transform="translate(0.403503 0.526367)" />
                            </clipPath>
                        </defs>
                    </svg>
                </button>
            </div>

            {erro && <p style={{ color: 'red' }}>{erro}</p>}

            <div className="table-rounded-wrapper">
                <table cellPadding="10" className="table-rounded">
                    <thead style={{ backgroundColor: '#374151', color: '#fff' }}>
                    <tr>
                        <th>Equipamento</th>
                        <th>Defeito / Motivo</th>
                        <th>Tipo</th>
                        <th>Status</th>
                        <th>Custo</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {manutencoesFiltradas.length > 0 ? (
                        manutencoesFiltradas.map(manutencao => (
                            <tr key={manutencao.id}>
                                <td>
                                    <strong>{manutencao.item?.nome}</strong> 
                                    <br/>
                                    <span style={{ fontSize: '0.85em', color: '#666' }}>Patrimônio: {manutencao.item?.patrimonio}</span>
                                </td>
                                <td>{manutencao.defeito}</td>
                                <td style={{ textAlign: 'center' }}>{manutencao.tipo}</td>
                                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                    {renderStatus(manutencao.status)}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    {formatarCusto(manutencao.custo)}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        {manutencao.status === 'EM_ANDAMENTO' && (
                                            <>
                                                <button onClick={() => handleConcluirClick(manutencao)} style={{ padding: '6px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                    ✅ Concluir
                                                </button>
                                                <button onClick={() => alterarStatus(manutencao.id, 'ESPERANDO_PECA')} style={{ padding: '6px 12px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                    ⏸️ Faltou Peça
                                                </button>
                                            </>
                                        )}
                                        {manutencao.status === 'ESPERANDO_PECA' && (
                                            <button onClick={() => alterarStatus(manutencao.id, 'EM_ANDAMENTO')} style={{ padding: '6px 12px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                ▶️ Retomar Serviço
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                Nenhum equipamento encontrado
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <ModalConcluirManutencao
                isOpen={modalConcluirAberto}
                onClose={() => setModalConcluirAberto(false)}
                manutencao={manutencaoSelecionada}
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default PainelManutencoes;
