import { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import { GrVmMaintenance, GrAddCircle } from "react-icons/gr";
import { CgCloseO } from "react-icons/cg";
import toast from 'react-hot-toast';
import '../styles/FormularioItem.css';

const FormularioItem = ({ onAtualizou }) => {
    const [isOpen, setIsOpen] = useState(false);

    const initialState = {
        nome: '',
        patrimonio: '',
        nomeLaboratorio: '',
        fotoUrl: '', 
        statusAtual: 'DISPONIVEL'
    };

    const [formData, setFormData] = useState(initialState);
    const [nomeArquivo, setNomeArquivo] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const comprimirImagem = (file, callback) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; 
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const base64Reduzida = canvas.toDataURL('image/jpeg', 0.7);
                callback(base64Reduzida);
            }
        };
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNomeArquivo(file.name);
            comprimirImagem(file, (base64) => {
                setFormData({ ...formData, fotoUrl: base64 });
            });
        }
    };

    const removerFoto = (e) => {
        e.preventDefault();
        setFormData({ ...formData, fotoUrl: '' });
        setNomeArquivo('');
        document.getElementById('file-upload').value = ''; 
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        api.post('/itens', formData)
            .then(() => {
                toast.success('Equipamento cadastrado com sucesso!', {
                    style: { background: '#333', color: '#fff' }
                });
                setFormData(initialState);
                setNomeArquivo('');
                if (onAtualizou) onAtualizou();
                setIsOpen(false);
            })
            .catch(error => {
                console.error("Erro ao cadastrar item:", error);
                toast.error('Erro no servidor ao cadastrar o item.', {
                    style: { background: '#333', color: '#fff' }
                });
            });
    };

    const modal = (
        <div className="dark-modal-overlay">
            <div className="dark-form-card" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="dark-form-inner">
                    
                    {/* Cabeçalho do Modal Padronizado */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <GrVmMaintenance size={24} color="#fff" />
                            <h1 className="dark-title" style={{ margin: 0 }}>Novo Equipamento</h1>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }} title="Fechar">
                            <CgCloseO size={24} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
                        <input className="dark-input" placeholder="Nome do Item" type="text" name="nome" value={formData.nome} onChange={handleChange} required />
                        <input className="dark-input" placeholder="Patrimônio" type="text" name="patrimonio" value={formData.patrimonio} onChange={handleChange} required />
                        <input className="dark-input" placeholder="Laboratório" type="text" name="nomeLaboratorio" value={formData.nomeLaboratorio} onChange={handleChange} required />
                        
                        <div className="file-upload-form">
                            <label className="file-upload-label" htmlFor="file-upload">
                                <div className="file-upload-design">
                                    <svg height="1em" viewBox="0 0 640 512"><path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" /></svg>
                                    <p>{nomeArquivo ? ` ${nomeArquivo}` : "Arraste e Solte a Foto"}</p>
                                    
                                    {nomeArquivo ? (
                                        <button onClick={removerFoto} className="btn btn-sm mt-2" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 10px' }}>
                                            Remover Foto
                                        </button>
                                    ) : (
                                        <span className="browse-button">Procurar Arquivo</span>
                                    )}
                                </div>
                                <input type="file" id="file-upload" accept="image/*" onChange={handleFileUpload} />
                            </label>
                        </div>

                        <button className="dark-submit-btn" type="submit">Cadastrar Equipamento</button>
                    </form>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-add-floating" onClick={() => setIsOpen(true)}>
                    <span>Cadastrar Novo Item</span>
                    <GrAddCircle size={26} color="#ffffff" style={{ marginLeft: '10px' }} />
                </button>
            </div>

            {/* Portal: renderiza o modal direto no <body>, fora de qualquer stacking context */}
            {isOpen && createPortal(modal, document.body)}
        </div>
    );
};

export default FormularioItem;