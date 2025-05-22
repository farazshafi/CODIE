import React from 'react'

const BackgroundGrid = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-black/70 bg-[linear-gradient(to_right,#1e1e1e_1px,transparent_1px),linear-gradient(to_bottom,#1e1e1e_1px,transparent_1px)] bg-[size:50px_50px]">
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-white/10 via-transparent to-transparent"></div>
            </div>
        </div>
    )
} 

export default BackgroundGrid