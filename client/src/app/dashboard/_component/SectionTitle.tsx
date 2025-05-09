import React from 'react';

interface SectionTitleProps {
    title: string;
    tagColor?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = React.memo(({ title, tagColor = "bg-black" }) => {
    return (
        <>
            <div className="flex flex-row mt-10 items-center w-full">
                <div
                    className={`${tagColor === "bg-white" ? "text-black" : "text-white"} rounded-lg px-3 py-2 w-full max-w-fit ${tagColor}`}
                >
                    <p className="w-full break-words">{title}</p>
                </div>
                <div className="h-[3px] bg-gray-700 w-full ml-5"></div>
            </div >
        </>

    );
});

export default SectionTitle;