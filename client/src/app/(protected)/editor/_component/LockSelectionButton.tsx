import { LockIcon } from 'lucide-react'
import React from 'react'

const LockSelectionButton = ({ onLock }: { onLock: () => void }) => {
    return (
        <button
            onClick={onLock}
            className="p-2 rounded bg-green-400 text-black flex items-center gap-2 hover:bg-green-600 cursor-pointer"
        >
            <LockIcon size={16} />
            Lock Section
        </button>
    )
}

export default LockSelectionButton