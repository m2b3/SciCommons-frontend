import { HomeFeaturesTileData } from '@/constants/common.constants';

import FeatureTile from './FeatureTile';

const FeaturesSection = () => {
  return (
    <div className="relative my-3 overflow-clip md:my-6">
      <div className="grid w-full grid-cols-1 gap-4 px-4 sm:grid-cols-2 md:gap-8 md:px-8 lg:grid-cols-3">
        {HomeFeaturesTileData?.map((card, i) => (
          <FeatureTile item={card} key={`${card.heading}-${i}`} />
        ))}
      </div>
    </div>
  );
};

export default FeaturesSection;
