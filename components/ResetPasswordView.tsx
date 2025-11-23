import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon } from './icons';

interface ResetPasswordViewProps {
  email: string | null;
  onSubmit: (password: string) => Promise<{ success: boolean; message?: string }>;
  onSwitchToLogin: () => void;
}

const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ email, onSubmit, onSwitchToLogin }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      // Se não houver e-mail no estado, o usuário não deveria estar aqui.
      // Redireciona para o login para segurança.
      onSwitchToLogin();
    }
  }, [email, onSwitchToLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem. Certifique-se de digitar a mesma senha nos dois campos.');
      return;
    }
    if (password.length < 6) {
      setError('Para sua segurança, a senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (email && password.toLowerCase() === email.toLowerCase()) {
      setError('Por segurança, sua nova senha não pode ser igual ao seu endereço de e-mail. Escolha uma senha diferente.');
      return;
    }

    setIsLoading(true);
    const result = await onSubmit(password);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onSwitchToLogin();
      }, 3000); // Aguarda 3 segundos antes de redirecionar
    } else {
      setError(result.message || 'Não conseguimos redefinir sua senha no momento. Tente novamente.');
    }
    
    setIsLoading(false);
  };

  const inputClasses = "w-full px-3 py-2 pr-10 placeholder-slate-400 border rounded-md shadow-sm appearance-none border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white";

  if (success) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
         <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Senha Redefinida!</h2>
            <p className="text-slate-600 dark:text-slate-300">Sua senha foi atualizada com sucesso. Você será redirecionado para a tela de login em instantes.</p>
         </div>
       </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        <div>
          <h2 className="text-3xl font-extrabold text-center text-slate-900 dark:text-slate-100">
            Crie uma Nova Senha
          </h2>
          <p className="mt-2 text-sm text-center text-slate-600 dark:text-slate-400">
            Redefinindo senha para <span className="font-medium">{email}</span>.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="new-password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Nova Senha
            </label>
            <div className="relative mt-1">
              <input
                id="new-password"
                name="new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
              />
               <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Mínimo de 6 caracteres.</p>
          </div>
          <div>
            <label htmlFor="confirm-password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Confirmar Nova Senha
            </label>
            <div className="relative mt-1">
              <input
                id="confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClasses}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border-l-4 border-red-500 rounded-md" role="alert">
              <p>{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordView;