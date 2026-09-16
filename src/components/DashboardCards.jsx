import { useState, useEffect } from 'react';
import api from '../services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';

const DashboardCards = ({ triggerAtualizacao }) => {
    const [totalEquipamentos, setTotalEquipamentos] = useState(0);
    const [naOficina, setNaOficina] = useState(0);
    const [aguardandoPeca, setAguardandoPeca] = useState(0);
    const [manutencoesAtivas, setManutencoesAtivas] = useState([]);

    useEffect(() => {
        Promise.all([
            api.get('/itens'),
            api.get('/manutencoes')
        ]).then(([resItens, resManutencoes]) => {
            const listaItens = resItens.data;
            setTotalEquipamentos(listaItens.length);
            
            const ativas = resManutencoes.data
                .filter(m => m.status !== 'CONCLUIDO')
                .map(m => {
                    const itemEncontrado = listaItens.find(i => 
                        i.historicoManutencoes && i.historicoManutencoes.some(hist => hist.id === m.id)
                    );
                    return { ...m, item: m.item || itemEncontrado };
                });

            setManutencoesAtivas(ativas);
            setNaOficina(ativas.filter(m => m.status === 'EM_ANDAMENTO').length);
            setAguardandoPeca(ativas.filter(m => m.status === 'ESPERANDO_PECA').length);
        }).catch(err => console.error("Erro ao carregar dados:", err));
    }, [triggerAtualizacao]);

// Estilo dos Cards de Resumo (Totais) - Tema Escuro
    const cardResumoStyle = {
        backgroundColor: '#1f2937', // Cinza azulado escuro
        color: '#e5e7eb', // Texto quase branco
        padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
        textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        height: '100%', minHeight: '160px', borderTop: '5px solid #ccc', boxSizing: 'border-box'
    };

    // Estilo dos Cards Dinâmicos (O Seu Desenho) - Tema Escuro
    const cardItemQuebradoStyle = {
        backgroundColor: '#1f2937', color: '#e5e7eb',
        padding: '15px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'row', gap: '15px', alignItems: 'center', 
        height: '100%', minHeight: '160px', boxSizing: 'border-box'
    };

    return (
        <div style={{ marginBottom: '30px', paddingBottom: '20px' }}>
            <Swiper
                modules={[Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                loop={true}
                speed={1000} 
                breakpoints={{
                    640: { slidesPerView: 2 },
                    960: { slidesPerView: 3 }
                }}
                autoplay={{ delay: 3500, disableOnInteraction: false }}
                style={{ paddingBottom: '10px' }} 
            >
                {/* Cards de Resumo */}
                <SwiperSlide style={{ height: 'auto' }}>
                    <div style={{ ...cardResumoStyle, borderTopColor: '#3498db', backgroundColor: 'rgba(52, 152, 219, 0.1)' }}>
                        <div style={{ fontSize: '2em' }}>📦</div>
                        <h3 style={{ margin: '10px 0', color: '#a1a1a1' }}>Total de Equipamentos</h3>
                        <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#3498db' }}>{totalEquipamentos}</div>
                    </div>
                </SwiperSlide>

                <SwiperSlide style={{ height: 'auto' }}>
                    <div style={{ ...cardResumoStyle, borderTopColor: '#e74c3c', backgroundColor: 'rgba(230, 34, 34, 0.19)' }}>
                        <div style={{ fontSize: '2em' }}>🔧</div>
                        <h3 style={{ margin: '10px 0', color: '#a1a1a1' }}>Na Oficina</h3>
                        <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#e74c3c' }}>{naOficina}</div>
                    </div>
                </SwiperSlide>

                <SwiperSlide style={{ height: 'auto' }}>
                    <div style={{ ...cardResumoStyle, borderTopColor: '#f1c40f', backgroundColor: 'rgba(241, 196, 15, 0.1)' }}>
                        <div style={{ fontSize: '2em' }}>🟡</div>
                        <h3 style={{ margin: '10px 0', color: '#a1a1a1' }}>Aguardando Peça</h3>
                        <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#f1c40f' }}>{aguardandoPeca}</div>
                    </div>
                </SwiperSlide>

                {/* Cards Dinâmicos (O Layout que você desenhou) */}
                {manutencoesAtivas.map(manutencao => {
                    const isFaltandoPeca = manutencao.status === 'ESPERANDO_PECA';
                    const corBorda = isFaltandoPeca ? '#f1c40f' : '#e74c3c';
                    const textoStatus = isFaltandoPeca ? '🟡 Aguardando Peça' : '🔴 Em Oficina';

                    return (
                        <SwiperSlide key={manutencao.id} style={{ height: 'auto' }}>
                            <div style={{ ...cardItemQuebradoStyle, borderLeft: `5px solid ${corBorda}` }}>
                                
                                {/* Esquerda: Foto do Item */}
                                <div style={{
                                    flex: '0 0 100px', // Largura fixa do quadrado da foto
                                    height: '100px',
                                    backgroundColor: '#f4f4f4',
                                    borderRadius: '8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'hidden'
                                }}>
                                    {manutencao.item?.fotoUrl ? (
                                        <img src={manutencao.item.fotoUrl} alt="Item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '2.5em' }}></span>
                                    )}
                                </div>

                                {/* Direita: Textos e Descrição */}
                                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left' }}>
                                    
                                    {/* Nome */}
                                    <h4 style={{ margin: '0 0 5px 0', color: '#a1a1a1', fontSize: '1.1em' }}>
                                        {manutencao.item?.nome}
                                    </h4>
                                    
                                    {/* Status */}
                                    <div style={{ fontSize: '0.85em', fontWeight: 'bold', color: corBorda, marginBottom: '8px' }}>
                                        {textoStatus}
                                    </div>
                                    
                                    {/* Caixa de Descrição do Defeito */}
                                    <div style={{
                                        backgroundColor: '#f9f9f9',
                                        padding: '8px',
                                        borderRadius: '5px',
                                        border: '1px solid #eee',
                                        fontSize: '0.85em',
                                        color: '#555',
                                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' // Trunca o texto se for muito grande
                                    }}>
                                        <strong>Defeito:</strong> {manutencao.defeito}
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
};

export default DashboardCards;