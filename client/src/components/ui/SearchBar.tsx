
import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
    onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onSearch) {
            onSearch(e.target.value);
        }
    };

    return (
        <div className="admin-search flex items-center px-3 py-1 w-full sm:w-auto transition-all duration-200 hover:shadow-md">
            <Search className="h-4 w-4 text-admin-muted mr-2 shrink-0" />
            <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none focus:outline-none text-sm w-full"
                onChange={handleChange}
            />
        </div>
    );
};

export default SearchBar;