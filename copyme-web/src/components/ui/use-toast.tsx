/** @format */

import * as React from 'react';
import { useState } from 'react';

type ToastProps = {
	title?: string;
	description?: string;
	variant?: 'default' | 'destructive';
};

type ToastContextType = {
	toast: (props: ToastProps) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<ToastProps[]>([]);

	const toast = (props: ToastProps) => {
		setToasts((prev) => [...prev, props]);
		setTimeout(() => {
			setToasts((prev) => prev.slice(1));
		}, 3000);
	};

	return (
		<ToastContext.Provider value={{ toast }}>
			{children}
			<div className='fixed bottom-0 right-0 z-50 p-4 space-y-4'>
				{toasts.map((toast, index) => (
					<div
						key={index}
						className={`p-4 rounded-md shadow-md ${
							toast.variant === 'destructive' ? 'bg-red-500 text-white' : 'bg-white'
						}`}>
						{toast.title && <h4 className='font-medium'>{toast.title}</h4>}
						{toast.description && <p className='text-sm'>{toast.description}</p>}
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}

export function useToast() {
	const context = React.useContext(ToastContext);
	if (context === undefined) {
		throw new Error('useToast must be used within a ToastProvider');
	}
	return context;
}
