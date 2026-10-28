import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import { CgCloseO } from "react-icons/cg";
import toast from 'react-hot-toast';

const ModalConcluirManutencao = ({ isOpen, onClose, manutencao, onSuccess }) => {
    const [servicoExecutado, setServicoExecutado] = useState('');
    const [pecasTrocadas, setPecasTrocadas] = useState('');
    const [custo, setCusto] = useState('');
    const [dataConclusao, setDataConclusao] = useState('');

    useEffect(() => {
        if (isOpen) {
            setServicoExecutado('');
            setPecasTrocadas('');
            setCusto('');
            setDataConclusao(new Date().toISOString().split('T')[0]); 
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const salvarConclusao = () => {
        const payload = {
            servicoExecutado,
            pecasTrocadas,
            custo: parseFloat(custo) || 0,
            dataConclusao: dataConclusao
        };

        api.put(`/manutencoes/concluir/${manutencao.id}`, payload)
            .then(() => {
                toast.success('Manutenção concluída com sucesso!', { style: { background: '#333', color: '#fff' } });
                onSuccess(); 
                onClose();   
            })
            .catch(error => {
                console.error("Erro ao concluir manutenção:", error);
                toast.error('Erro ao concluir a manutenção.', { style: { background: '#333', color: '#fff' } });
            });
    };

    return createPortal(
        <div className="modal-dark-overlay">
            <div className="modal-dark-card">
                
                {/* Cabeçalho com o Título e o Ícone de Fechar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 className="modal-dark-title" style={{ margin: 0 }}>Concluir Manutenção</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                        <CgCloseO size={24} />
                    </button>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label className="modal-dark-label">Data de Conclusão:</label>
                    <input type="date" className="modal-dark-input" value={dataConclusao} onChange={(e) => setDataConclusao(e.target.value)} />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label className="modal-dark-label">Serviço Executado:</label>
                    <textarea className="modal-dark-input" value={servicoExecutado} onChange={(e) => setServicoExecutado(e.target.value)} rows="3" style={{ resize: 'vertical' }}></textarea>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label className="modal-dark-label">Peças Trocadas (Opcional):</label>
                    <textarea className="modal-dark-input" value={pecasTrocadas} onChange={(e) => setPecasTrocadas(e.target.value)} rows="2" style={{ resize: 'vertical' }}></textarea>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label className="modal-dark-label">Custo (R$):</label>
                    <input type="number" step="0.01" className="modal-dark-input" value={custo} onChange={(e) => setCusto(e.target.value)} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={onClose} className="btn btn-secondary fw-bold">Cancelar</button>
                    <button onClick={salvarConclusao} className="btn btn-success fw-bold">Salvar e Concluir</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ModalConcluirManutencao;