import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import { CgCloseO } from "react-icons/cg";
import toast from 'react-hot-toast';

const ModalAbrirManutencao = ({ isOpen, onClose, item, onSuccess }) => {
    const [tipoManutencao, setTipoManutencao] = useState('CORRETIVA');
    const [defeito, setDefeito] = useState('');
    const [dataAbertura, setDataAbertura] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTipoManutencao('CORRETIVA');
            setDefeito('');
            setDataAbertura(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const salvarManutencao = () => {
        const payload = { 
            tipo: tipoManutencao, 
            defeito: defeito, 
            dataDefeito: dataAbertura, 
            dataInicio: dataAbertura 
        };
        
        api.post(`/manutencoes/abrir/${item.id}`, payload)
            .then(() => {
                toast.success('Manutenção aberta com sucesso!', { style: { background: '#333', color: '#fff' } });
                onSuccess(); 
                onClose();   
            })
            .catch(error => {
                console.error("Erro ao abrir manutenção:", error);
                toast.error('Erro ao abrir manutenção.', { style: { background: '#333', color: '#fff' } });
            });
    };

    return createPortal(
        <div className="modal-dark-overlay">
            <div className="modal-dark-card" style={{ width: '400px' }}>
                
                {/* Cabeçalho com o Título e o Ícone de Fechar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 className="modal-dark-title" style={{ margin: 0 }}>Abrir Manutenção</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                        <CgCloseO size={24} />
                    </button>
                </div>

                <p style={{ color: '#9ca3af', marginBottom: '15px' }}><strong>Item:</strong> {item?.nome} ({item?.patrimonio})</p>
                
                <div style={{ marginBottom: '15px' }}>
                    <label className="modal-dark-label">Data da Quebra:</label>
                    <input type="date" className="modal-dark-input" value={dataAbertura} onChange={(e) => setDataAbertura(e.target.value)}/>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label className="modal-dark-label">Tipo de Manutenção:</label>
                    <select className="modal-dark-input" value={tipoManutencao} onChange={(e) => setTipoManutencao(e.target.value)}>
                        <option value="CORRETIVA">Corretiva</option>
                        <option value="PREVENTIVA">Preventiva</option>
                    </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label className="modal-dark-label">Defeito / Motivo:</label>
                    <textarea className="modal-dark-input" value={defeito} onChange={(e) => setDefeito(e.target.value)} rows="4" style={{ resize: 'vertical' }}></textarea>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={onClose} className="btn btn-secondary fw-bold">Cancelar</button>
                    <button onClick={salvarManutencao} className="btn btn-success fw-bold">Salvar</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ModalAbrirManutencao;