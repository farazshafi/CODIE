import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedInputProps {
    id: string;
    label: string;
    type?: string;
    required?: boolean;
    className?: string;
    error?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AnimatedInput = ({
    id,
    label,
    type = 'text',
    required = false,
    className,
    error,
    value,
    onChange,
}: AnimatedInputProps) => {
    const [focused, setFocused] = useState(false);

    return (
        <div className="relative w-full animated-border">
            <input
                id={id}
                type={type}
                required={required}
                className={cn(
                    "w-full bg-codeeditor-gray rounded-md border border-codeeditor-border px-4 py-3 text-white placeholder-codeeditor-lightgray/50 focus:outline-none focus:ring-0 focus:border-codeeditor-green transition-all duration-200",
                    error ? "border-destructive" : "",
                    className
                )}
                placeholder={label}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
            <label
                htmlFor={id}
                className={cn(
                    "floating-label",
                    (focused || value) ? "text-xs -translate-y-5 text-codeeditor-green" : "text-codeeditor-lightgray"
                )}
            >
                {label}
            </label>
            {error && (
                <p className="text-destructive text-xs mt-1 ml-1 animate-fade-in">
                    {error}
                </p>
            )}
        </div>
    );
};

export default AnimatedInput;