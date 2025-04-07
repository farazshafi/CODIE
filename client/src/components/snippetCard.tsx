"use client";
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Clock, Star, Trash2 } from 'lucide-react';
import SpotlightCard from './ui/SpotlightCard/SpotlightCard';


const SnippetCard = () => {
    return (

        <div className=' rounded-lg p-5 '>
            <SpotlightCard >

                {/* header */}
                <div className='flex flex-row items-center justify-between'>
                    {/* left */}
                    <div className='flex'>
                        <img className='rounded-lg' height={"60px"} width={"60px"} src="https://logowik.com/content/uploads/images/911_c_logo.jpg" alt="language-logo" />
                        <div className='flex flex-col justify-between ml-3'>
                            <div className='text-white py-1 px-2 w-fit rounded-sm bg-primary'>
                                <p className='text-xs'>JavaScript</p>
                            </div>
                            <div className='flex text-xs flex-row items-center gap-x-1'>
                                <Clock size={"10px"} />
                                <p>09-10-2004</p>
                            </div>
                        </div>
                    </div>

                    {/* right */}
                    <div className='gap-x-4 flex flex-row items-center'>
                        <Button className='bg-primary cursor-pointer hover:bg-black'>
                            <Trash2 />
                        </Button>
                        <Button className='bg-green cursor-pointer hover:bg-green-600'>
                            <Star />
                        </Button>
                    </div>
                </div>
                {/* body */}
                <div className='mt-5'>
                    <p className='font-bold  cursor-pointer text-lg'>Prime Numbers in c++</p>
                    <div className='text-white  cursor-pointer p-1 rounded-sm bg-primary flex items-center w-fit mt-2 gap-x-3'>
                        <Avatar className="ml-2 text-xs">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>US</AvatarFallback>
                        </Avatar>
                        <p className='text-xs'>faraz shafi</p>
                    </div>
                </div>

                {/* code iamge */}
                <div className='mt-5  cursor-pointer'>
                    <img height={155} width={235} src="https://images.ctfassets.net/lzny33ho1g45/5hzHWhjxP8bM3Ew2SJgKuS/ae69008c04ab864f602254bf349725e7/acode.webp" alt="code-image" />
                </div>
            </SpotlightCard>

        </div>
    )
}

export default SnippetCard