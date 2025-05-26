
import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    setCurrentPage
}) => {
    return (
        <div className="flex justify-end items-center mt-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 mx-1 rounded-md transition-all duration-200 transform ${pageNum === currentPage
                        ? 'bg-green-500 text-black font-medium scale-105'
                        : 'text-admin-muted hover:bg-gray-700 hover:text-white hover:scale-105'
                        }`}
                >
                    {pageNum}
                </button>
            ))}
        </div>
    );
};

export default Pagination;
