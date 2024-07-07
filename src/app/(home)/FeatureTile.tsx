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
    <div className="flex w-52 flex-col gap-2 rounded-common-xl border border-common-contrast bg-common-background p-6 md:w-96">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="rounded-full">{item?.icon}</div>
        <h3 className="text-xl font-bold text-text-primary">{item?.heading}</h3>
      </div>
      <div className="w-full text-base text-text-secondary">{item?.content}</div>
    </div>
  );
};

export default FeatureTile;
