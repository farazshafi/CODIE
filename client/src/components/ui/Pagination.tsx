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

    const getPageNumbers = (): (number | 'left-ellipsis' | 'right-ellipsis')[] => {
        const pages: (number | 'left-ellipsis' | 'right-ellipsis')[] = [];
        const showRange = 2; // pages to show either side of current

        // always include first page
        pages.push(1);

        // left ellipsis if gap
        if (currentPage - showRange > 2) {
            pages.push('left-ellipsis');
        }

        // middle window
        for (let i = currentPage - showRange; i <= currentPage + showRange; i++) {
            if (i > 1 && i < totalPages) {
                pages.push(i);
            }
        }

        // right ellipsis if gap
        if (currentPage + showRange < totalPages - 1) {
            pages.push('right-ellipsis');
        }

        // always include last page if > 1
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        // dedupe while preserving order (so duplicates like "1" or "totalPages" are removed)
        // using Set would also work: [...new Set(pages)]
        const deduped: (number | 'left-ellipsis' | 'right-ellipsis')[] = [];
        for (const p of pages) {
            if (!deduped.includes(p)) deduped.push(p);
        }

        return deduped;
    };

    const pageItems = getPageNumbers();

    return (
        <div className="flex justify-end items-center mt-4 space-x-1 flex-wrap">
            {/* Prev */}
            <button
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 px-2 rounded-md text-admin-muted disabled:opacity-40 hover:bg-gray-700 hover:text-white"
            >
                Prev
            </button>

            {pageItems.map((item, index) => {
                if (item === 'left-ellipsis' || item === 'right-ellipsis') {
                    return (
                        <span key={`${item}-${index}`} className="px-2 text-gray-500 select-none">
                            …
                        </span>
                    );
                }

                return (
                    <button
                        key={`${String(item)}-${index}`}
                        onClick={() => setCurrentPage(Number(item))}
                        aria-current={currentPage === item ? 'page' : undefined}
                        className={`h-8 w-8 rounded-md transition-all duration-200 ${
                            currentPage === item
                                ? 'bg-green-500 text-black font-medium scale-105'
                                : 'text-admin-muted hover:bg-gray-700 hover:text-white hover:scale-105'
                        }`}
                    >
                        {item}
                    </button>
                );
            })}

            {/* Next */}
            <button
                onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 px-2 rounded-md text-admin-muted disabled:opacity-40 hover:bg-gray-700 hover:text-white"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
