import { Unlock } from 'lucide-react';
import React from 'react'

const UnlockButton = ({ onUnlock }: { onUnlock: () => void }) => {
    return (
        <button
            onClick={onUnlock}
            className="p-2 rounded bg-gray-800 text-white flex items-center gap-2 hover:bg-gray-700 cursor-pointer outline"
        >
            <Unlock size={16} />
            Unlock Section
        </button>
    );
}

export default UnlockButton