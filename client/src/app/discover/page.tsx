import React from 'react';
import { Bookmark, CircleUserRound, Clock, Copy, Search, SlidersHorizontal, Star, Tag, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/ui/navbar';
import SnippetCard from '@/components/snippetCard';

interface SnippetCardProps {
    title: string;
    user: {
        name: string;
        avatar?: string;
    };
    language: string;
    code: string;
}


const page = () => {
    return (
        <>
            <Navbar />
            <div className="px-4 sm:px-10 md:px-16 lg:px-20 text-white py-10">
                <p className="text-center font-bold text-3xl sm:text-4xl md:text-5xl opacity-70">
                    Discover & Share Code Snippets
                </p>
                <p className="mt-5 text-center text-base sm:text-lg opacity-50">
                    Explore a curated collection of code snippets from the community
                </p>

                {/* search input */}
                <div className="mt-10 sm:mt-20 flex flex-row sm:flex-row items-center gap-3 sm:gap-x-3 bg-tertiary rounded-lg px-4 sm:px-5 py-3">
                    <Search />
                    <Input
                        placeholder="Search snippets by title, language, or author"
                        className="w-full"
                    />
                </div>

                {/* filter*/}
                <div className="mt-10 flex flex-col lg:flex-row justify-between gap-y-5">
                    {/* languages */}
                    <div className="flex flex-wrap gap-3">
                        <div className="text-white px-3 py-2 rounded-sm bg-tertiary flex items-center">
                            <Tag />
                            <p className="ml-2">Languages</p>
                        </div>
                        {['C++', 'JavaScript', 'Rust', 'Java', 'Python'].map((lang) => (
                            <div key={lang} className="text-white px-3 py-2 rounded-sm bg-tertiary">
                                <p>{lang}</p>
                            </div>
                        ))}
                    </div>

                    {/* sort options */}
                    <div className="flex flex-row items-center justify-between sm:justify-end gap-x-5">
                        <p className="text-sm text-white">12 snippets Found</p>
                        <div className="text-white px-3 py-2 rounded-sm bg-tertiary">
                            <SlidersHorizontal />
                        </div>
                    </div>
                </div>



                {/* responsible snippet cards */}
                <div className='mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-5'>

                    {/* single card */}
                    <SnippetCard />
                    <SnippetCard />
                    <SnippetCard />
                    <SnippetCard />

                </div>

            </div>
        </>

    );
}

export default page