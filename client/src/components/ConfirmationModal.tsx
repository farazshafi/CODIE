'use client'
import React from 'react'
import { createPortal } from 'react-dom'

type ConfirmationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    content: React.ReactNode;
}

const ConfirmationModal = ({ isOpen, onClose, onConfirm, content }: ConfirmationModalProps) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
            <div className="bg-white text-center rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                <div className="text-black text-base mb-6">{content}</div>
                <div className="flex justify-end gap-4">
                    <button
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>,
        typeof window !== 'undefined' ? document.body : document.createElement('div')
    )
}

export default ConfirmationModal
