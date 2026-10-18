"use client"

import Image from "next/image";

const CodeAnimation = () => {
    return (
        <div className="relative z-0 w-full flex justify-center md:pointer-events-none md:absolute md:inset-auto md:right-0 md:top-1/2 md:-translate-y-1/2 md:w-[72vw] md:max-w-[1100px] xl:max-w-[1280px]">
            <Image
                src="/landingpage.webp?v=2"
                alt="CODIE collaborative coding platform"
                width={1400}
                height={900}
                className="w-full max-w-md sm:max-w-lg h-auto object-contain opacity-90 md:max-w-none md:opacity-95"
                priority
                unoptimized
            />
        </div>
    );
};

export default CodeAnimation;
