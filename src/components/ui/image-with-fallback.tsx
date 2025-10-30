import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
    alt: string;
    className?: string;
}

export function ImageWithFallback({
    src,
    fallbackSrc = 'https://www.tanzaniatourism.com/images/uploads/Serengeti_Gnus_7765.jpg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    alt,
    className,
    ...props
}: ImageWithFallbackProps) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setImgSrc(fallbackSrc);
        }
    };

    return (
        <img
            {...props}
            src={imgSrc}
            alt={alt}
            className={cn(className)}
            onError={handleError}
            loading="lazy"
        />
    );
}
