
import React from 'react';
import QRCode from 'react-qr-code';
import { CloseIcon } from './icons';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, url }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm p-6 flex flex-col items-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-full flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Acessar no Celular</h3>
            <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none"
                aria-label="Fechar"
            >
                <CloseIcon className="w-5 h-5" />
            </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-inner border border-slate-200">
            <QRCode value={url} size={200} />
        </div>
        
        <p className="mt-6 text-sm text-center text-slate-600 dark:text-slate-300">
            Escaneie o código acima com a câmera do seu celular para abrir a escala.
        </p>

        <div className="mt-2 text-xs text-slate-400 break-all text-center">
            {url}
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
