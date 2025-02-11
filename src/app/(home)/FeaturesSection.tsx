import { HomeFeaturesTileData } from '@/constants/common.constants';

import FeatureTile from './FeatureTile';

const FeaturesSection = () => {
  return (
    <div className="relative my-6 overflow-clip">
      <div className="grid w-full grid-cols-1 gap-8 px-8 md:grid-cols-2 lg:grid-cols-3">
        {HomeFeaturesTileData?.map((card, i) => (
          <FeatureTile item={card} key={`${card.heading}-${i}`} />
        ))}
      </div>
    </div>
  );
};

export default FeaturesSection;
