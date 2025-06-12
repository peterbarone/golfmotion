'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: number
  title: string
  description?: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (
    title: string, 
    options?: { 
      description?: string, 
      type?: ToastType, 
      duration?: number 
    }
  ) => void
  removeToast: (id: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((
    title: string, 
    options?: { 
      description?: string, 
      type?: ToastType, 
      duration?: number 
    }
  ) => {
    const id = Date.now()
    const toast = {
      id,
      title,
      description: options?.description,
      type: options?.type || 'info',
      duration: options?.duration || 3000,
    }
    
    setToasts((prev) => [...prev, toast])
    
    setTimeout(() => {
      removeToast(id)
    }, toast.duration)
    
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context.addToast
}

const ToastContainer = () => {
  const context = useContext(ToastContext)
  if (!context) return null
  
  const { toasts, removeToast } = context

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`
            p-3 rounded-md shadow-md min-w-[280px] max-w-[400px] animate-fade-in
            ${toast.type === 'success' ? 'bg-green-100 border-l-4 border-green-500' : ''}
            ${toast.type === 'error' ? 'bg-red-100 border-l-4 border-red-500' : ''}
            ${toast.type === 'warning' ? 'bg-yellow-100 border-l-4 border-yellow-500' : ''}
            ${toast.type === 'info' ? 'bg-blue-100 border-l-4 border-blue-500' : ''}
          `}
        >
          <div className="flex justify-between items-center">
            <h3 className={`
              font-semibold text-sm
              ${toast.type === 'success' ? 'text-green-700' : ''}
              ${toast.type === 'error' ? 'text-red-700' : ''}
              ${toast.type === 'warning' ? 'text-yellow-700' : ''}
              ${toast.type === 'info' ? 'text-blue-700' : ''}
            `}>
              {toast.title}
            </h3>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          {toast.description && (
            <p className="text-xs mt-1 text-gray-600">{toast.description}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
