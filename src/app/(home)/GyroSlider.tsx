import { useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { HomeFeaturesTileData } from '@/constants/common.constants';

import FeatureTile from './FeatureTile';

export const GyroSlider = () => {
  const [active, setActive] = useState<number>(0);

  return (
    <div className="relative my-6 overflow-clip">
      <div className="gyroSlider-carousel h-96 md:h-48">
        {active > 0 && (
          <button
            className="absolute left-4 flex size-10 items-center justify-center rounded-full bg-common-cardBackground shadow-common hover:bg-common-minimal md:left-12"
            onClick={() => {
              setActive((i) => i - 1);
            }}
          >
            <ChevronLeft size={16} className="text-text-primary" />
          </button>
        )}
        {HomeFeaturesTileData?.map((card, i) => {
          return (
            <div
              key={i}
              className="gyroSlider-container"
              style={
                {
                  '--active': i === active ? 1 : 0,
                  '--offset': (active - i) / 3,
                  '--direction': Math.sign(active - i),
                  '--abs-offset': Math.abs(active - i) / 3,
                  pointerEvents: active === i ? 'auto' : 'none',
                  opacity: Math.abs(active - i) >= 3 ? '0' : '1',
                  display: Math.abs(active - i) > 3 ? 'none' : 'block',
                } as React.CSSProperties
              }
            >
              <FeatureTile item={card} />
            </div>
          );
        })}
        {active < HomeFeaturesTileData?.length - 1 && (
          <button
            className="absolute right-4 flex size-10 items-center justify-center rounded-full bg-common-cardBackground shadow-common hover:bg-common-minimal md:right-12"
            onClick={() => {
              setActive((i) => i + 1);
            }}
          >
            <ChevronRight size={16} className="text-text-primary" />
          </button>
        )}
      </div>
    </div>
  );
};

export default GyroSlider;
