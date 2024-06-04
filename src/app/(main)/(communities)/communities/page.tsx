import SearchBar from '@/components/SearchBar';
import CommunityCard from '@/components/communities/CommunityCard';
import { communityData } from '@/constants/dummyData';

const Communities = () => {
  return (
    <div className="container mx-auto space-y-4 p-4">
      <SearchBar />
      <div className="flex flex-col space-y-4">
        {communityData.map((community, index) => (
          <CommunityCard key={index} {...community} />
        ))}
      </div>
    </div>
  );
};

export default Communities;
