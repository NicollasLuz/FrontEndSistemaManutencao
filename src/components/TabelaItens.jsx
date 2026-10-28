import { createPortal } from 'react-dom';

import { useState, useEffect, Fragment } from 'react';
import api from '../services/api';

import ModalAbrirManutencao from './Modals/ModalAbrirManutencao';
import ModalEditarItem from './Modals/ModalEditarItem';
import FormularioItem from './FormularioItem';

import '../styles/TabelaItens.css';
import '../styles/App.css';

import { MdDeleteForever, MdManageHistory } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { GrVmMaintenance } from "react-icons/gr";

const TabelaItens = ({ triggerAtualizacao, onAtualizou }) => {
    const [fotoExpandida, setFotoExpandida] = useState(null);
    const [itens, setItens] = useState([]);
    const [erro, setErro] = useState('');
    const [itemExpandido, setItemExpandido] = useState(null);
    const [termoBuscaItem, setTermoBuscaItem] = useState('');
    
    // Estados do Modal de Abrir Manutenção
    const [modalAbrirAberto, setModalAbrirAberto] = useState(false);
    const [itemSelecionado, setItemSelecionado] = useState(null);
    
    // Estados do Modal de Edição
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [itemSelecionadoEditar, setItemSelecionadoEditar] = useState(null);

    const carregarItens = () => {
        api.get('/itens')
            .then(response => {
                setItens(response.data);
            })
            .catch(error => {
                console.error("Erro ao buscar itens:", error);
                setErro("Não foi possível carregar os itens.");
            });
    };

    // Dispara a busca quando o componente carrega ou quando triggerAtualizacao muda
    useEffect(() => {
        carregarItens();
    }, [triggerAtualizacao]);

    // Escuta o gatilho do App.jsx para recarregar sem F5
    useEffect(() => {
        carregarItens();
    }, [triggerAtualizacao]);

    const handleAbrirClick = (item) => {
        setItemSelecionado(item);
        setModalAbrirAberto(true);
    };

    const handleSuccess = () => {
        carregarItens();
        if (onAtualizou) onAtualizou();
    };

    const excluirItem = (id) => {
        if (window.confirm('Tem certeza que deseja excluir este item?')) {
            api.delete(`/itens/${id}`)
                .then(() => {
                    import('react-hot-toast').then(({ default: toast }) => {
                        toast.success('Item excluído com sucesso!', { style: { background: '#333', color: '#fff' } });
                    });
                    carregarItens();
                    if (onAtualizou) onAtualizou(); 
                })
                .catch(error => {
                    console.error("Erro ao excluir item:", error);
                    import('react-hot-toast').then(({ default: toast }) => {
                        toast.error('Erro ao excluir o item.', { style: { background: '#333', color: '#fff' } });
                    });
                });
        }
    };

    const abrirModalEditar = (item) => {
        setItemSelecionadoEditar(item);
        setModalEditarAberto(true);
    };

    const renderStatus = (item) => {
        if (item.statusAtual === 'DISPONIVEL') {
            return <span className="badge-status badge-green">Disponível</span>;
        }
        if (item.statusAtual === 'EM_MANUTENCAO') {
            if (item.historicoManutencoes && item.historicoManutencoes.length > 0) {
                const ultimaManutencao = item.historicoManutencoes[item.historicoManutencoes.length - 1];
                if (ultimaManutencao.status === 'ESPERANDO_PECA') {
                    return <span className="badge-status badge-yellow">Aguardando Peça</span>;
                }
            }
            return <span className="badge-status badge-red">Em Oficina</span>;
        }
        return <span className="badge-status badge-blue">{item.statusAtual}</span>;
    };

    const toggleExpandir = (id) => {
        setItemExpandido(itemExpandido === id ? null : id);
    };

    // Aplica o filtro de busca
    const itensFiltrados = itens.filter(item => 
        item.nome?.toLowerCase().includes(termoBuscaItem.toLowerCase()) || 
        item.patrimonio?.toLowerCase().includes(termoBuscaItem.toLowerCase())
    );
    

    return (
        <div style={{ padding: '20px', backgroundColor: '#1f2937', color: '#e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
            <h2 style={{ marginTop: 0 }}>Inventário de Laboratório</h2>
            
            <div className="sticky-search-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '20px', flexWrap: 'wrap' }}>
                
                <div className="custom-search-box" style={{ marginBottom: '0', flex: '1', maxWidth: '500px' }}>
                    <input 
                        type="text" 
                        placeholder="Buscar por nome ou patrimônio..." 
                        value={termoBuscaItem}
                        onChange={(e) => setTermoBuscaItem(e.target.value)}
                        className="custom-search-input"
                    />
                    <button className="custom-search-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 29 29" fill="none">
                            <g clipPath="url(#clip0_2_17)">
                                <g filter="url(#filter0_d_2_17)">
                                    <path d="M23.7953 23.9182L19.0585 19.1814M19.0585 19.1814C19.8188 18.4211 20.4219 17.5185 20.8333 16.5251C21.2448 15.5318 21.4566 14.4671 21.4566 13.3919C21.4566 12.3167 21.2448 11.252 20.8333 10.2587C20.4219 9.2653 19.8188 8.36271 19.0585 7.60242C18.2982 6.84214 17.3956 6.23905 16.4022 5.82759C15.4089 5.41612 14.3442 5.20435 13.269 5.20435C12.1938 5.20435 11.1291 5.41612 10.1358 5.82759C9.1424 6.23905 8.23981 6.84214 7.47953 7.60242C5.94407 9.13789 5.08145 11.2204 5.08145 13.3919C5.08145 15.5634 5.94407 17.6459 7.47953 19.1814C9.01499 20.7168 11.0975 21.5794 13.269 21.5794C15.4405 21.5794 17.523 20.7168 19.0585 19.1814Z" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" shapeRendering="crispEdges" />
                                </g>
                            </g>
                        </svg>
                    </button>
                </div>

                <div>
                    <FormularioItem onAtualizou={onAtualizou} />
                </div>

            </div>

            {erro && <p className="error-msg">{erro}</p>}
            
            {/* WRAPPER ADICIONADO AQUI NA TABELA PRINCIPAL */}
            <div className="table-rounded-wrapper">
                <table className="table table-hover table-striped align-middle mb-0 table-rounded">
                    <thead className="tabela-thead">
                        <tr>
                            <th>Foto</th>
                            <th>Patrimônio</th>
                            <th>Nome</th>
                            <th>Laboratório</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itensFiltrados.length > 0 ? (
                            itensFiltrados.map(item => (
                                <Fragment key={item.id}>
                                    <tr>
                                    <td className="text-center">
                                        {item.fotoUrl ? (
                                            <button 
                                                onClick={() => setFotoExpandida(item.fotoUrl)} 
                                                className="btn btn-outline-info btn-sm"
                                                style={{ color: '#2AF598', borderColor: '#2AF598' }}
                                            >
                                                Ver Item 
                                            </button>
                                        ) : (
                                            <span style={{ color: '#6b7280', fontSize: '0.9em' }}>🚫 Sem foto</span>
                                        )}
                                    </td>
                                    <td>{item.patrimonio}</td>
                                    <td>{item.nome}</td>
                                    <td>{item.nomeLaboratorio}</td>
                                    <td className="status-cell" title={item.statusAtual}>
                                        {renderStatus(item)}
                                    </td>
                                    <td className="text-center">
                                        <div className="actions-container">
                                            
                                            {/* Botão de Histórico */}
                                            <button 
                                                onClick={() => toggleExpandir(item.id)}
                                                className="btn btn-info btn-sm text-white"
                                                title="Ver Histórico"
                                            >
                                                <MdManageHistory size={20} />
                                            </button>
                                            
                                        {item.statusAtual === 'DISPONIVEL' ? (
                                            <>
                                                {/* Botão de Manutenção */}
                                                <button 
                                                    onClick={() => handleAbrirClick(item)} 
                                                    className="btn btn-warning btn-sm" 
                                                    title="Abrir Manutenção"
                                                >
                                                    <GrVmMaintenance size={18} />
                                                </button>
                                                
                                                {/* Botão de Editar */}
                                                <button 
                                                    onClick={() => abrirModalEditar(item)} 
                                                    className="btn btn-primary btn-sm" 
                                                    title="Editar Item"
                                                >
                                                    <FaEdit size={18} />
                                                </button>
                                                
                                                {/* Botão de Excluir */}
                                                <button 
                                                    onClick={() => excluirItem(item.id)} 
                                                    className="btn btn-danger btn-sm" 
                                                    title="Excluir Item"
                                                >
                                                    <MdDeleteForever size={20} />
                                                </button>
                                            </>
                                        ) : (
                                            <span className="status-oficina">
                                                Em oficina...
                                            </span>
                                        )}
                                        </div>
                                    </td>
                                </tr>
                                {itemExpandido === item.id && (
                                    <tr className="row-expanded">
                                        <td colSpan="6" className="td-expanded">
                                            <h4 className="expanded-title">Histórico de Manutenções</h4>
                                            {item.historicoManutencoes && item.historicoManutencoes.length > 0 ? (
                                                
                                                /* WRAPPER ADICIONADO AQUI NA TABELA DE HISTÓRICO */
                                                <div className="table-rounded-wrapper">
                                                    <table cellPadding="8" className="history-table table-rounded mb-0">
                                                        <thead className="history-thead">
                                                            <tr>
                                                                <th>Data de Ida (Quebra)</th>
                                                                <th>Data de Volta (Conclusão)</th>
                                                                <th>Defeito</th>
                                                                <th>Serviço Executado</th>
                                                                <th>Custo</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {item.historicoManutencoes.map(hist => {
                                                                // Função blindada para evitar bug de fuso horário e aceitar vários nomes do Back-end
                                                                const formatarData = (dataString) => {
                                                                    if (!dataString) return null;
                                                                    const partes = dataString.split('T')[0].split('-'); 
                                                                    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`; // Retorna DD/MM/YYYY
                                                                    return new Date(dataString).toLocaleDateString('pt-BR');
                                                                };

                                                                // Tenta pegar a data de ida de qualquer campo que o seu Java possa ter gerado
                                                                const dataIda = formatarData(hist.dataDefeito || hist.dataInicio || hist.dataAbertura);
                                                                const dataVolta = formatarData(hist.dataConclusao);

                                                                return (
                                                                    <tr key={hist.id}>
                                                                        <td className="text-center fw-bold text-danger">
                                                                            {dataIda || '-'}
                                                                        </td>
                                                                        <td className={`text-center fw-bold ${dataVolta ? 'text-success' : 'text-warning'}`}>
                                                                            {dataVolta || 'Oficina...'}
                                                                        </td>
                                                                        <td>{hist.defeito || '-'}</td>
                                                                        <td>{hist.servicoExecutado || '-'}</td>
                                                                        <td className="text-center">{hist.custo ? `R$ ${hist.custo.toFixed(2).replace('.', ',')}` : '-'}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>

                                            ) : (
                                                <p className="history-empty">Nenhum registro encontrado.</p>
                                            )}
                                        </td>
                                    </tr>
                                )}
                                </Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="table-empty">
                                    Nenhum item encontrado...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div> {/* FECHAMENTO DO WRAPPER DA TABELA PRINCIPAL */}

            <ModalAbrirManutencao
                isOpen={modalAbrirAberto}
                onClose={() => setModalAbrirAberto(false)}
                item={itemSelecionado}
                onSuccess={handleSuccess}
            />

            <ModalEditarItem
                isOpen={modalEditarAberto}
                onClose={() => setModalEditarAberto(false)}
                item={itemSelecionadoEditar}
                onSuccess={handleSuccess}
            />

            {fotoExpandida && createPortal(
                <div className="modal-dark-overlay" onClick={() => setFotoExpandida(null)}>
                    <div style={{ position: 'relative', textAlign: 'center' }}>
                        <button 
                            className="dark-close-btn" 
                            style={{ position: 'absolute', top: '-40px', right: '0', color: '#fff' }}
                            onClick={() => setFotoExpandida(null)}
                        >
                            ✖ Fechar
                        </button>
                        <img src={fotoExpandida} alt="Equipamento Ampliado" className="foto-modal-img" />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
    
export default TabelaItens;