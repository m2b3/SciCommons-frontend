import { useEffect, useState } from 'react';

import Identicon from '@/lib/Identicon/Identicon';
import { generateRandomHash } from '@/lib/helpers';

const useIdenticon = (size: number): string => {
  const [identicon, setIdenticon] = useState<string>('');

  useEffect(() => {
    const hash = generateRandomHash();
    const identicon = new Identicon(hash, size).toString();
    setIdenticon(identicon);
  }, [size]);

  return identicon;
};

export default useIdenticon;
