import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from './icons';

interface SignUpViewProps {
  onSignUp: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  onSwitchToLogin: () => void;
}

const SignUpView: React.FC<SignUpViewProps> = ({ onSignUp, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
    }
    if (trimmedName && password.toLowerCase() === trimmedName.toLowerCase()) {
        setError('A senha não pode ser igual ao seu nome. Escolha uma senha mais segura.');
        return;
    }
    if (trimmedEmail && password.toLowerCase() === trimmedEmail.toLowerCase()) {
        setError('A senha não pode ser igual ao seu e-mail. Escolha uma senha mais segura.');
        return;
    }

    setError(null);
    setIsLoading(true);
    const result = await onSignUp(trimmedName, trimmedEmail, password);
    if (!result.success) {
      setError(result.message || 'Ocorreu um erro ao criar a conta.');
    }
    setIsLoading(false);
  };

  const inputClasses = "w-full px-3 py-2 placeholder-slate-400 border rounded-md shadow-sm appearance-none border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400";

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        <div>
          <h2 className="text-3xl font-extrabold text-center text-slate-900 dark:text-slate-100">
            Criar Nova Conta
          </h2>
          <p className="mt-2 text-sm text-center text-slate-600 dark:text-slate-400">
            Junte-se a nós preenchendo o formulário abaixo.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Nome Completo
            </label>
            <div className="mt-1">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email-signup" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Endereço de e-mail
            </label>
            <div className="mt-1">
              <input
                id="email-signup"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password-signup" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Senha
            </label>
            <div className="relative mt-1">
              <input
                id="password-signup"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClasses} pr-10`}
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
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border-l-4 border-red-500" role="alert">
              <p>{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </div>
        </form>
        <p className="mt-6 text-sm text-center text-slate-600 dark:text-slate-400">
            Já tem uma conta?{' '}
            <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus:underline"
            >
                Faça login aqui
            </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpView;