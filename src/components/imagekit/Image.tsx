'use client';
import { Image, Video, ImageKitProvider, buildSrc } from '@imagekit/next';
import { StaticImageData } from 'next/image';
import { useState } from 'react';

export default function ImageKit({
  className,
  src,
  alt,
  handleError,
}: {
  className?: string;
  src: string | StaticImageData;
  alt: string;
  handleError?: () => void;
}) {
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  return (
    <ImageKitProvider
      urlEndpoint={process.env.IMAGEKIT_URL_ENDPOINT} // New prop
    >
      <Image
        className={className ?? 'size-10'}
        transformation={[{ width: 500, height: 500 }]}
        src={src as string}
        width={500}
        height={500}
        onError={handleError}
        style={
          showPlaceholder
            ? {
                backgroundImage: `url(${buildSrc({
                  urlEndpoint: 'https://ik.imagekit.io/ikmedia',
                  src: '/default-image.jpg',
                  transformation: [
                    // {}, // Any other transformation you want to apply
                    {
                      quality: 10,
                      blur: 90,
                    },
                  ],
                })})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
              }
            : {}
        }
        onLoad={() => {
          setShowPlaceholder(false);
        }}
        alt={alt}
        loading='eager'
      />
    </ImageKitProvider>
  );
}
