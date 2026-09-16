import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

const ModalEditarItem = ({ isOpen, onClose, item, onSuccess }) => {
    const [itemEditando, setItemEditando] = useState({ id: '', nome: '', patrimonio: '', nomeLaboratorio: '', fotoUrl: '' });
    const [nomeArquivoEdicao, setNomeArquivoEdicao] = useState('');

    useEffect(() => {
        if (isOpen && item) {
            setItemEditando({ ...item });
            setNomeArquivoEdicao(item.fotoUrl ? 'Imagem atual salva' : '');
        }
    }, [isOpen, item]);

    if (!isOpen) return null;

    const salvarEdicao = () => {
        api.put(`/itens/${itemEditando.id}`, itemEditando)
            .then(() => {
                toast.success('Item atualizado com sucesso!', { style: { background: '#333', color: '#fff' } });
                onSuccess();
                onClose();
            })
            .catch(error => {
                console.error("Erro ao editar item:", error);
                toast.error('Erro ao salvar as edições.', { style: { background: '#333', color: '#fff' } });
            });
    };

    const handleChangeEdicao = (e) => {
        setItemEditando({ ...itemEditando, [e.target.name]: e.target.value });
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

    const handleFileUploadEdicao = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNomeArquivoEdicao(file.name);
            comprimirImagem(file, (base64) => {
                setItemEditando({ ...itemEditando, fotoUrl: base64 });
            });
        }
    };

    const removerFotoEdicao = (e) => {
        e.preventDefault();
        setItemEditando({ ...itemEditando, fotoUrl: '' });
        setNomeArquivoEdicao('');
        document.getElementById('file-upload-edit').value = '';
    };

    return createPortal(
        <div className="modal-dark-overlay">
            <div className="modal-dark-card" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <h3 className="modal-dark-title">Editar Item</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    <div>
                        <label className="modal-dark-label">Nome do Item:</label>
                        <input type="text" name="nome" className="modal-dark-input" value={itemEditando.nome || ''} onChange={handleChangeEdicao}/>
                    </div>
                    <div>
                        <label className="modal-dark-label">Patrimônio:</label>
                        <input type="text" name="patrimonio" className="modal-dark-input" value={itemEditando.patrimonio || ''} onChange={handleChangeEdicao}/>
                    </div>
                    <div>
                        <label className="modal-dark-label">Laboratório:</label>
                        <input type="text" name="nomeLaboratorio" className="modal-dark-input" value={itemEditando.nomeLaboratorio || ''} onChange={handleChangeEdicao}/>
                    </div>
                    
                    <div style={{ marginTop: '5px' }}>
                        <label className="modal-dark-label">Foto do Item:</label>
                        <div className="file-upload-form">
                            <label className="file-upload-label" htmlFor="file-upload-edit" style={{ padding: '15px 20px' }}>
                                <div className="file-upload-design">
                                    <p>{nomeArquivoEdicao ? ` ${nomeArquivoEdicao}` : "Arraste e Solte nova Foto"}</p>
                                    {nomeArquivoEdicao ? (
                                        <button onClick={removerFotoEdicao} className="btn btn-sm mt-1" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}>
                                            Remover Foto
                                        </button>
                                    ) : (
                                        <span className="browse-button">Procurar Arquivo</span>
                                    )}
                                </div>
                                <input type="file" id="file-upload-edit" accept="image/*" onChange={handleFileUploadEdicao} />
                            </label>
                        </div>
                    </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={onClose} className="btn btn-secondary fw-bold">Cancelar</button>
                    <button onClick={salvarEdicao} className="btn btn-primary fw-bold" style={{ backgroundColor: '#2AF598', color: '#000', border: 'none' }}>Salvar Alterações</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ModalEditarItem;