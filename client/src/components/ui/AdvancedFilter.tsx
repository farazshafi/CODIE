"use client"
import { Funnel } from 'lucide-react';
import React, { useState } from 'react';

interface AdvancedFilterProps {
    onFilterChange: (filter: 'all' | 'suspended' | 'active') => void;
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({ onFilterChange }) => {
    const [showOptions, setShowOptions] = useState(false);
    const [selected, setSelected] = useState<'all' | 'suspended' | 'active'>('all');

    const handleSelect = (value: 'all' | 'suspended' | 'active') => {
        setSelected(value);
        onFilterChange(value);
        setShowOptions(false);
    };

    return (
        <div className="relative">
            <button
                className="bg-gray-800 flex flex-row items-center gap-x-4 text-white px-4 py-2 rounded hover:bg-gray-700"
                onClick={() => setShowOptions(!showOptions)}
            >
                <Funnel />
                Filter
            </button>

            {showOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-300 rounded shadow-lg z-10">
                    <button
                        onClick={() => handleSelect('all')}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-700 ${selected === 'all' ? 'bg-white text-black' : ''}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => handleSelect('suspended')}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-700 ${selected === 'suspended' ? 'bg-white text-black' : ''}`}
                    >
                        Suspended
                    </button>
                    <button
                        onClick={() => handleSelect('active')}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-700 ${selected === 'active' ? 'bg-white text-black' : ''}`}
                    >
                        Active
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdvancedFilter;
