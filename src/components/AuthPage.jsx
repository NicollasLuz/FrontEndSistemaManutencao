import { useState, useRef } from 'react';

const AuthPage = ({ onLogin }) => {
    const [telaAtual, setTelaAtual] = useState('login');

    // --- ESTADOS DO FORMULÁRIO DE LOGIN ---
    const [loginEmail, setLoginEmail] = useState('');
    const [loginSenha, setLoginSenha] = useState('');

    // --- ESTADOS DO FORMULÁRIO DE REGISTRO ---
    const [regNome, setRegNome] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regSenha, setRegSenha] = useState('');
    const [regConfirmarSenha, setRegConfirmarSenha] = useState('');

    // --- ESTADOS DE FEEDBACK (MENSAGENS E CARREGAMENTO) ---
    const [mensagemErro, setMensagemErro] = useState('');
    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [loading, setLoading] = useState(false);

    // --- ESTADOS E LÓGICA DO OTP (RECUPERAR SENHA) ---
    const [otp, setOtp] = useState(['', '', '', '']);
    const inputRefs = useRef([]);

    // Função auxiliar para trocar de tela limpando mensagens anteriores
    const mudarTela = (novaTela) => {
        setTelaAtual(novaTela);
        setMensagemErro('');
        setMensagemSucesso('');
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== '' && index < 3) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    // --- REQUISIÇÃO DE LOGIN PARA O JAVA ---
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setMensagemErro('');
        setMensagemSucesso('');
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, senha: loginSenha }),
            });

            if (response.ok) {
                const data = await response.json();
                
                // 1. Salva o token JWT no localStorage
                localStorage.setItem('token', data.token);

                // 2. Extrai role e e-mail de dentro do token JWT com tratamento de Base64URL
                let role = 'USER';
                let email = loginEmail;

                try {
                    const base64Url = data.token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(
                        window.atob(base64)
                            .split('')
                            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                            .join('')
                    );
                    const payload = JSON.parse(jsonPayload);
                    
                    role = payload.role || 'USER';
                    email = payload.sub || loginEmail;
                } catch (err) {
                    console.error("Erro ao decodificar o token JWT:", err);
                }

                // 3. Salva o objeto do usuário completo (com ADMIN!)
                const dadosUsuario = {
                    login: email,
                    email: email,
                    role: role
                };
                localStorage.setItem('usuario', JSON.stringify(dadosUsuario));

                setMensagemSucesso('Login realizado com sucesso!');

                // 4. Notifica o App.jsx apenas para atualizar o estado de logado
                if (onLogin) onLogin();
            } else {
                const textoErro = await response.text();
                setMensagemErro(textoErro || 'Erro ao realizar login.');
            }
        } catch (err) {
            setMensagemErro('Servidor indisponível. Verifique se o backend está rodando.');
        } finally {
            setLoading(false);
        }
    };

    // --- REQUISIÇÃO DE CADASTRO PARA O JAVA ---
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setMensagemErro('');
        setMensagemSucesso('');

        if (regSenha !== regConfirmarSenha) {
            setMensagemErro('As senhas não coincidem!');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nomeCompleto: regNome,
                    email: regEmail,
                    senha: regSenha,
                }),
            });

            const textoResposta = await response.text();

            if (response.ok) {
                setMensagemSucesso(textoResposta);
                setRegNome('');
                setRegEmail('');
                setRegSenha('');
                setRegConfirmarSenha('');
            } else {
                setMensagemErro(textoResposta || 'Erro ao realizar cadastro.');
            }
        } catch (err) {
            setMensagemErro('Servidor indisponível. Verifique se o backend está rodando.');
        } finally {
            setLoading(false);
        }
    };

    // --- FORMULÁRIO 1: LOGIN ---
    const renderLogin = () => (
        <>
            <h2 className="auth-title">Bem-vindo(a)</h2>
            <p className="auth-subtitle">Faça login para acessar o sistema</p>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }} onSubmit={handleLoginSubmit}>
                <input 
                    required 
                    className="auth-input" 
                    type="email" 
                    placeholder="Seu E-mail"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                />
                <input 
                    required 
                    className="auth-input" 
                    type="password" 
                    placeholder="Sua Senha" 
                    value={loginSenha}
                    onChange={(e) => setLoginSenha(e.target.value)}
                />
                
                <span className="auth-link" onClick={() => mudarTela('forgot')}>Esqueceu a senha?</span>
                
                <button className="auth-btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>

            <p className="auth-text-center" style={{ marginTop: '20px' }}>
                Não tem uma conta? <span className="auth-link" style={{ display: 'inline' }} onClick={() => mudarTela('register')}>Cadastre-se</span>
            </p>
        </>
    );

    // --- FORMULÁRIO 2: REGISTRO ---
    const renderRegister = () => (
        <>
            <h2 className="auth-title">Criar Conta</h2>
            <p className="auth-subtitle">Cadastre-se para ter acesso total.</p>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }} onSubmit={handleRegisterSubmit}>
                <input 
                    required 
                    className="auth-input" 
                    type="text" 
                    placeholder="Nome Completo" 
                    value={regNome}
                    onChange={(e) => setRegNome(e.target.value)}
                />
                <input 
                    required 
                    className="auth-input" 
                    type="email" 
                    placeholder="E-mail" 
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                />
                <input 
                    required 
                    className="auth-input" 
                    type="password" 
                    placeholder="Senha" 
                    value={regSenha}
                    onChange={(e) => setRegSenha(e.target.value)}
                />
                <input 
                    required 
                    className="auth-input" 
                    type="password" 
                    placeholder="Confirmar Senha" 
                    value={regConfirmarSenha}
                    onChange={(e) => setRegConfirmarSenha(e.target.value)}
                />
                
                <button className="auth-btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Cadastrando...' : 'Criar Conta'}
                </button>
            </form>

            <p className="auth-text-center" style={{ marginTop: '20px' }}>
                Já possui uma conta? <span className="auth-link" style={{ display: 'inline' }} onClick={() => mudarTela('login')}>Fazer Login</span>
            </p>
        </>
    );

    // --- FORMULÁRIO 3: RECUPERAR SENHA (OTP) ---
    const renderForgot = () => (
        <>
            <h2 className="auth-title">Verificação</h2>
            <p className="auth-subtitle">Digite o código de 4 dígitos enviado para o seu e-mail.</p>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="otp-container">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            className="otp-input"
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        />
                    ))}
                </div>
                
                <button className="auth-btn-primary" type="button" style={{ backgroundColor: '#4b5563', background: 'none', border: '1px solid #4b5563' }}>
                    Verificar Código
                </button>
            </form>

            <p className="auth-text-center">
                Não recebeu o código? <span className="auth-link" style={{ display: 'inline' }}>Reenviar</span>
            </p>
            
            <span className="auth-link" style={{ textAlign: 'center', marginTop: '10px' }} onClick={() => mudarTela('login')}>
                ← Voltar para o Login
            </span>
        </>
    );

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                {mensagemErro && (
                    <div style={{ color: '#fca5a5', backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '6px', marginBottom: '15px', textAlign: 'center', fontSize: '0.9rem' }}>
                        {mensagemErro}
                    </div>
                )}
                {mensagemSucesso && (
                    <div style={{ color: '#86efac', backgroundColor: 'rgba(34, 197, 94, 0.2)', padding: '10px', borderRadius: '6px', marginBottom: '15px', textAlign: 'center', fontSize: '0.9rem' }}>
                        {mensagemSucesso}
                    </div>
                )}

                {telaAtual === 'login' && renderLogin()}
                {telaAtual === 'register' && renderRegister()}
                {telaAtual === 'forgot' && renderForgot()}
            </div>
        </div>
    );
};

export default AuthPage;