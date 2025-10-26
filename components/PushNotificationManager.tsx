import React, { useState, useEffect } from 'react';
import { BellIcon, BellSlashIcon } from './icons';

const PUSH_ENABLED_KEY = 'pushNotificationsEnabled';

const PushNotificationManager: React.FC = () => {
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isEnabled, setIsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            setIsSupported(true);
            setPermission(Notification.permission);
            const savedPref = localStorage.getItem(PUSH_ENABLED_KEY) === 'true';
            // User preference is only valid if permission is already granted
            setIsEnabled(savedPref && Notification.permission === 'granted');
        }
        setIsLoading(false);
    }, []);

    const requestPermissionAndEnable = async () => {
        if (!isSupported) return;

        const currentPermission = await Notification.requestPermission();
        setPermission(currentPermission);

        if (currentPermission === 'granted') {
            localStorage.setItem(PUSH_ENABLED_KEY, 'true');
            setIsEnabled(true);
        } else {
            // If denied or dismissed, ensure it's disabled.
            localStorage.setItem(PUSH_ENABLED_KEY, 'false');
            setIsEnabled(false);
        }
    };
    
    const disable = () => {
        localStorage.setItem(PUSH_ENABLED_KEY, 'false');
        setIsEnabled(false);
    }
    
    if (isLoading) {
        return <div className="p-4 bg-slate-100 rounded-lg text-center text-slate-500">Carregando...</div>;
    }
    
    if (!isSupported) {
        return (
            <div className="p-4 bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400 rounded-r-lg">
                <h4 className="font-bold">Navegador incompatível</h4>
                <p className="text-sm">Seu navegador não suporta notificações push.</p>
            </div>
        );
    }

    if (permission === 'denied') {
        return (
             <div className="p-4 bg-red-50 text-red-800 border-l-4 border-red-400 rounded-r-lg">
                <h4 className="font-bold">Permissão Negada</h4>
                <p className="text-sm">Você bloqueou as notificações. Para reativá-las, altere as configurações do seu navegador.</p>
            </div>
        );
    }
    
    if (isEnabled) {
        return (
            <div className="p-4 bg-green-50 text-green-800 border-l-4 border-green-400 rounded-r-lg flex items-center justify-between">
                <div>
                    <h4 className="font-bold">Notificações Ativadas</h4>
                    <p className="text-sm">Você receberá lembretes sobre suas tarefas.</p>
                </div>
                <button 
                    onClick={disable}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors"
                >
                    <BellSlashIcon className="w-5 h-5" />
                    Desativar
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 bg-slate-100 rounded-lg flex items-center justify-between">
            <div>
                <h4 className="font-bold">Lembretes de Tarefas</h4>
                <p className="text-sm text-slate-600">Receba notificações sobre suas escalas no dia anterior.</p>
            </div>
            <button
                onClick={requestPermissionAndEnable}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
                <BellIcon className="w-5 h-5"/>
                Ativar Notificações
            </button>
        </div>
    );
};

export default PushNotificationManager;
