import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon, SpinnerIcon } from './icons';

interface LoginViewProps {
  onLogin: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onSwitchToSignUp, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const success = await onLogin(email, password, rememberMe);
    if (!success) {
      setError('E-mail ou senha inválidos. Tente novamente.');
    }
    setIsLoading(false);
  };

  const inputBaseClasses = "w-full px-3 py-2 placeholder-slate-400 border rounded-md shadow-sm appearance-none focus:outline-none sm:text-sm";
  const inputErrorClasses = "border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500";
  const inputNormalClasses = "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500";


  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="text-3xl font-extrabold text-center text-slate-900">
            Acessar Escala
          </h2>
          <p className="mt-2 text-sm text-center text-slate-600">
            Faça login para visualizar a escala de trabalho.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Endereço de e-mail
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                }}
                className={`${inputBaseClasses} ${error ? inputErrorClasses : inputNormalClasses}`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password"className="block text-sm font-medium text-slate-700">
              Senha
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                }}
                className={`${inputBaseClasses} ${error ? inputErrorClasses : inputNormalClasses} pr-10`}
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
                <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="remember-me" className="block ml-2 text-sm text-slate-900">
                    Lembrar de mim
                </label>
            </div>
            <div className="text-sm">
                <button
                    type="button"
                    onClick={onForgotPassword}
                    className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
                >
                    Esqueceu sua senha?
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
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isLoading ? <SpinnerIcon className="w-5 h-5" /> : 'Entrar'}
            </button>
          </div>
        </form>
         <p className="mt-6 text-sm text-center text-slate-600">
            Não tem uma conta?{' '}
            <button
                type="button"
                onClick={onSwitchToSignUp}
                className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
            >
                Crie uma aqui
            </button>
        </p>
      </div>
    </div>
  );
};

export default LoginView;