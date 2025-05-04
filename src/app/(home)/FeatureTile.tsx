import React from 'react';

interface FeatureTileProps {
  item: {
    icon: React.ReactNode;
    heading: string;
    content: string;
  };
}

const FeatureTile: React.FC<FeatureTileProps> = ({ item }) => {
  return (
    <div className="flex flex-col gap-4 rounded-common-xl border border-common-contrast bg-common-background/70 p-6">
      <div className="flex items-center gap-4">
        <div className="rounded-full">{item?.icon}</div>
        <h3 className="text-base font-bold text-text-primary md:text-xl">{item?.heading}</h3>
      </div>
      <div className="w-full text-sm text-text-secondary md:text-base">{item?.content}</div>
    </div>
  );
};

export default FeatureTile;
