import React, { useState, useEffect, useRef } from "react";
import cn from "classnames";

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  thumbNail: string;
}

export default function Image({ alt, src, thumbNail, ...props }: ImageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsLoading(true);
            imgElement.src = src as string;
            observer.unobserve(imgElement!);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(imgElement);

    return () => {
      if (imgElement) {
        observer.unobserve(imgElement);
      }
    };
  }, [src]);

  return (
    <>
      <img
        ref={imgRef}
        className={cn(
          "w-full h-full relative z-10 transition-opacity object-cover",
          {
            "opacity-0": isLoading,
            "opacity-100 group-hover:opacity-0": !isLoading,
          }
        )}
        alt={alt}
        src=""
        {...props}
        onLoad={() => setIsLoading(false)}
        width="640"
        height="640"
      />
      <img
        src={thumbNail}
        alt=""
        className={cn(
          "absolute inset-0 object-cover blur-2xl transition-opacity",
          isLoading ? "opacity-80" : "opacity-0 group-hover:opacity-50"
        )}
        width="640"
        height="640"
      />
    </>
  );
}
