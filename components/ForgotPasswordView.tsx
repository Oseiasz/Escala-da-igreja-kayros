import React, { useState } from 'react';

interface ForgotPasswordViewProps {
  onSubmit: (email: string) => Promise<{ success: boolean; message?: string }>;
  onSwitchToLogin: () => void;
}

const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onSubmit, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const result = await onSubmit(email);

    if (result.success) {
      setSuccessMessage('Se o e-mail existir em nosso sistema, um link para redefinir a senha foi enviado.');
      // A lógica de navegação é tratada no App.tsx
    } else {
      setError(result.message || 'Ocorreu um erro.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        <div>
          <h2 className="text-3xl font-extrabold text-center text-slate-900 dark:text-slate-100">
            Redefinir Senha
          </h2>
          <p className="mt-2 text-sm text-center text-slate-600 dark:text-slate-400">
            Digite seu e-mail para receber as instruções.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-forgot" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Endereço de e-mail
            </label>
            <div className="mt-1">
              <input
                id="email-forgot"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 placeholder-slate-400 border rounded-md shadow-sm appearance-none border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border-l-4 border-red-500" role="alert">
              <p>{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-3 text-sm text-green-700 bg-green-100 border-l-4 border-green-500" role="alert">
              <p>{successMessage}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || !!successMessage}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
        <p className="mt-6 text-sm text-center text-slate-600 dark:text-slate-400">
            Lembrou da senha?{' '}
            <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus:underline"
            >
                Voltar para o login
            </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordView;