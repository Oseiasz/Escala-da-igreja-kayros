
import React from 'react';
import { BellIcon, CloseIcon } from './icons';

interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  return (
    <div
      className="fixed bottom-4 right-4 w-full max-w-sm p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg flex items-start space-x-4 z-50 animate-slide-in border dark:border-slate-700"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex-shrink-0">
        <BellIcon className="w-6 h-6 text-indigo-500" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Lembrete de Tarefa</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{message}</p>
      </div>
      <div className="flex-shrink-0">
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800"
          aria-label="Fechar notificação"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Notification;