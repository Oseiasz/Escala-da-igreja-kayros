
import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon, SpinnerIcon, CalendarIcon } from './icons';

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onSwitchToSignUp, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
        const result = await onLogin(email, password);
        if (!result.success) {
            setError(result.message || 'Credenciais inválidas.');
        }
    } catch (err) {
        setError('Erro de conexão. Tente novamente.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-church-white dark:bg-church-black transition-colors duration-500">
      <div className="w-full max-w-md p-10 space-y-8 bg-white dark:bg-church-surface rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-black dark:bg-zinc-800 rounded-[1.5rem] flex items-center justify-center shadow-xl">
             <CalendarIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-black dark:text-white tracking-tighter uppercase">
            Acesso à Escala
          </h2>
          <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
            Entre para gerenciar atividades
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-zinc-50 dark:bg-church-black border border-zinc-200 dark:border-zinc-800 rounded-2xl text-black dark:text-white font-bold outline-none focus:ring-2 focus:ring-zinc-400 transition-all"
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-zinc-50 dark:bg-church-black border border-zinc-200 dark:border-zinc-800 rounded-2xl text-black dark:text-white font-bold outline-none focus:ring-2 focus:ring-zinc-400 transition-all pr-14"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 text-xs font-black uppercase tracking-widest text-center text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 rounded-xl animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-black dark:bg-zinc-800 text-white font-black rounded-2xl shadow-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {isLoading ? <SpinnerIcon className="w-6 h-6" /> : 'Entrar na Conta'}
          </button>
        </form>

        <div className="text-center">
            <p className="text-xs font-bold text-zinc-500">
              Não tem acesso?{' '}
              <button type="button" onClick={onSwitchToSignUp} className="text-black dark:text-zinc-300 font-black hover:underline">
                  Cadastre-se aqui
              </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
