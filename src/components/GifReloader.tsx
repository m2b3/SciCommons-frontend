import { useEffect, useState } from 'react';

import Image from 'next/image';

const GifReloader = ({ gifUrl, interval }: { gifUrl: string; interval: number }) => {
  const [gifSrc, setGifSrc] = useState(gifUrl);

  useEffect(() => {
    const reloadGif = () => {
      setGifSrc(`${gifUrl}?${new Date().getTime()}`);
    };

    const gifInterval = setInterval(reloadGif, interval);

    // Cleanup the interval on component unmount
    return () => clearInterval(gifInterval);
  }, [gifUrl, interval]);

  return (
    <div>
      <Image src={gifSrc} alt="Looping GIF" width={150} height={150} className="h-24 w-24" />
    </div>
  );
};

export default GifReloader;
