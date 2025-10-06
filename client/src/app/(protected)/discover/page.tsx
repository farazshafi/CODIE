"use client"
import React, { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/ui/navbar';
import SnippetCard from '@/components/snippetCard';
import PageTransitionWrapper from '@/components/TransitionWrapper';
import { useMutationHook } from '@/hooks/useMutationHook';
import { findDiscoveriesApi } from '@/apis/discoverApi';
import SnippetCardSkeleton from "./_components/SnippetCardSkeleton";
import Pagination from '@/components/ui/Pagination';
import { LANGUAGE_CONFIG } from '../editor/_constants';

export interface IDiscover {
    projectId: {
        projectName: string;
        projectCode: string;
        projectLanguage: string;
        userId: {
            _id: string;
            name: string;
        };
        _id: string;
    },
    like: number,
    _id: string,
    starred: number;
    views: number,
    createdAt: Date,
    updatedAt: Date
}

const Page = () => {
    const [discoveries, setDiscoveries] = useState<IDiscover[]>([]);
    const [totalPage, setTotalPage] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [keyword, setKeyword] = useState("");
    const [sortBy, setSortBy] = useState<"stars" | "recent" | "">("");


    const { mutate, isLoading } = useMutationHook(findDiscoveriesApi, {
        onSuccess(data) {
            console.log("discoverApi data", data)
            setDiscoveries(data.data.discoveries);
            setTotalPage(data.data.totalPages);
            setCurrentPage(data.data.currentPage);
        }
    });

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        mutate({
            keyword,
            language: selectedLanguage,
            page: newPage,
            limit: 6,
            sortBy,
        });
    };

    const selectLanguage = (language: string) => {
        const newLanguage = selectedLanguage === language ? "" : language;
        setSelectedLanguage(newLanguage);
        setCurrentPage(1); // Reset page
        mutate({
            keyword,
            language: newLanguage,
            page: 1,
            limit: 6,
            sortBy,
        });
    };

    const refetchSnippets = () => {
        mutate({
            keyword,
            language: selectedLanguage,
            page: currentPage,
            limit: 6,
            sortBy,
        });
    }

    useEffect(() => {
        mutate({ keyword, language: selectedLanguage, page: 1, limit: 6, sortBy });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDeleteSnippet = () => {
        mutate({ keyword, language: selectedLanguage, page: 1, limit: 6, sortBy });
    }

    useEffect(() => {
        const delay = setTimeout(() => {
            setCurrentPage(1);
            mutate({
                keyword,
                language: selectedLanguage,
                page: 1,
                limit: 6,
                sortBy
            });
        }, 500);
        return () => clearTimeout(delay);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyword, selectedLanguage]);

    return (
        <>
            <Navbar />
            <PageTransitionWrapper>
                <div className="px-4 sm:px-10 md:px-16 lg:px-20 text-white py-10">
                    <p className="text-center font-bold text-3xl sm:text-4xl md:text-5xl opacity-70">
                        Discover & Share Code Snippets
                    </p>
                    <p className="mt-5 text-center text-base sm:text-lg opacity-50">
                        Explore a curated collection of code snippets from the community
                    </p>

                    {/* Search input */}
                    <div className="mt-10 sm:mt-20 flex items-center gap-3 bg-tertiary rounded-lg px-4 py-3">
                        <Search />
                        <Input
                            placeholder="Search snippets by title, or author"
                            className="w-full"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <div className="mt-10 flex flex-col lg:flex-row justify-between gap-y-5">
                        <div className="flex flex-wrap gap-3">
                            <div className="text-black px-3 py-2 rounded-sm bg-green flex items-center">
                                <Tag />
                                <p className="ml-2">Languages</p>
                            </div>
                            {Object.entries(LANGUAGE_CONFIG).map(([key]) => (
                                <div
                                    key={key}
                                    onClick={() => selectLanguage(key)}
                                    className="hover:bg-gray-800 text-white px-3 py-2 rounded-sm bg-tertiary cursor-pointer"
                                >
                                    <p className={`${selectedLanguage === key ? "text-green-500" : ""}`}>{key}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-x-5">
                            <p className="text-sm text-white">{discoveries.length} snippets found</p>

                            <div className="flex items-center gap-3">
                                <div className="text-white px-3 py-2 rounded-sm bg-tertiary">
                                    <SlidersHorizontal />
                                </div>
                                <select
                                    value={sortBy}
                                    onChange={(e) => {
                                        const value = e.target.value as "stars" | "recent" | "";
                                        setSortBy(value);
                                        setCurrentPage(1);
                                        mutate({
                                            keyword,
                                            language: selectedLanguage,
                                            page: 1,
                                            limit: 6,
                                            sortBy: value,
                                        });
                                    }}
                                    className="bg-black text-white px-3 py-2 rounded-sm"
                                >
                                    <option value="">Default</option>
                                    <option value="stars">Stars</option>
                                    <option value="recent">Most Recent</option>
                                </select>
                            </div>

                        </div>
                    </div>

                    {/* Snippet cards */}
                    <div className='mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-5'>
                        {isLoading && discoveries.length === 0
                            ? Array(6).fill(0).map((_, index) => <SnippetCardSkeleton key={index} />)
                            : discoveries.map((item, index) => <SnippetCard refetchSnippets={refetchSnippets} isStarred={false} onDelete={handleDeleteSnippet} project={item} key={index} />)
                        }

                        {discoveries.length === 0 && (
                            <div>
                                <p>No Snippets yet</p>
                            </div>
                        )}

                    </div>

                    {/* Pagination */}
                    <div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPage}
                            setCurrentPage={handlePageChange}
                        />
                    </div>
                </div>

            </PageTransitionWrapper>
        </>
    );
};

export default Page;
