import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info, Loader } from 'lucide-react';

const UIContext = createContext();

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};

export const UIProvider = ({ children }) => {
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        title: '',
        message: '',
        onConfirm: null,
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        isDangerous: false,
        loading: false
    });

    const showToast = useCallback((message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
    }, []);

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            setConfirmModal({
                open: true,
                title: options.title || 'Are you sure?',
                message: options.message || 'This action cannot be undone.',
                confirmText: options.confirmText || 'Confirm',
                cancelText: options.cancelText || 'Cancel',
                isDangerous: options.isDangerous || false,
                loading: false,
                onConfirm: async () => {
                    setConfirmModal(prev => ({ ...prev, loading: true }));
                    try {
                        if (options.onConfirm) await options.onConfirm();
                        resolve(true);
                    } catch (error) {
                        console.error(error);
                        resolve(false);
                    } finally {
                        setConfirmModal(prev => ({ ...prev, open: false, loading: false }));
                    }
                },
                onCancel: () => {
                    setConfirmModal(prev => ({ ...prev, open: false }));
                    resolve(false);
                }
            });
        });
    }, []);

    const closeToast = () => setToast(prev => ({ ...prev, show: false }));

    return (
        <UIContext.Provider value={{ showToast, confirm }}>
            {children}

            {/* Global Toast */}
            {toast.show && (
                <div className="fixed bottom-10 right-10 z-[10000] animate-in slide-in-from-bottom-5 duration-300">
                    <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === 'success' ? 'bg-green-600 text-white border-green-500' :
                        toast.type === 'error' ? 'bg-red-600 text-white border-red-500' :
                            'bg-blue-600 text-white border-blue-500'
                        }`}>
                        {toast.type === 'success' ? <CheckCircle2 size={20} /> :
                            toast.type === 'error' ? <AlertCircle size={20} /> :
                                <Info size={20} />}
                        <span className="font-bold">{toast.message}</span>
                        <button onClick={closeToast} className="ml-4 hover:bg-white/20 p-1 rounded-full text-white/80 hover:text-white transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Global Confirmation Modal */}
            {confirmModal.open && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl scale-in-center border-2 border-white/50">
                        <div className="text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${confirmModal.isDangerous ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                }`}>
                                {confirmModal.isDangerous ? <AlertCircle size={32} /> : <CheckCircle2 size={32} />}
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">{confirmModal.title}</h3>
                            <p className="text-gray-500 font-medium mb-8">{confirmModal.message}</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={confirmModal.onCancel}
                                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    {confirmModal.cancelText}
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    disabled={confirmModal.loading}
                                    className={`flex-1 py-3 px-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${confirmModal.isDangerous
                                        ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                                        : 'bg-[#123524] hover:bg-[#0d281a] shadow-green-200'
                                        }`}
                                >
                                    {confirmModal.loading ? (
                                        <div className="spinner-wrapper !w-5 !h-5">
                                            <div className="spinner-outer !border-2"></div>
                                            <div className="spinner-inner !border-2 !border-t-white"></div>
                                        </div>
                                    ) : <span>{confirmModal.confirmText}</span>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .scale-in-center { animation: scale-in-center 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
                @keyframes scale-in-center {
                    0% { transform: scale(0.9); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}} />
        </UIContext.Provider>
    );
};
