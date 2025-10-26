
import React from 'react';
import { BellIcon, CloseIcon } from './icons';

interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  return (
    <div
      className="fixed bottom-4 right-4 w-full max-w-sm p-4 bg-white rounded-lg shadow-lg flex items-start space-x-4 z-50 animate-slide-in"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex-shrink-0">
        <BellIcon className="w-6 h-6 text-indigo-500" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-800">Lembrete de Tarefa</p>
        <p className="mt-1 text-sm text-slate-600">{message}</p>
      </div>
      <div className="flex-shrink-0">
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          aria-label="Fechar notificação"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Notification;
