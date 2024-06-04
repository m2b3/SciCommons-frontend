import { Control, FieldValues, Path } from 'react-hook-form';

import FileUpload from './FileUpload';
import SearchComponent from './SearchComponent';

interface TabbedComponentProps<TFieldValues extends FieldValues> {
  activeTab: 'upload' | 'search';
  setActiveTab: (tab: 'upload' | 'search') => void;
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
}

const FileOrLinkTab = <TFieldValues extends FieldValues>({
  activeTab,
  setActiveTab,
  name,
  control,
}: TabbedComponentProps<TFieldValues>) => {
  return (
    <div className="mx-auto w-full rounded bg-white p-4 shadow">
      <div className="flex border-b border-gray-300">
        <button
          className={`flex-1 py-2 text-center transition-all duration-300 ${activeTab === 'upload' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload
        </button>
        <button
          className={`flex-1 py-2 text-center transition-all duration-300 ${activeTab === 'search' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('search')}
        >
          Search
        </button>
      </div>
      <div className="mt-4 transition-all duration-300">
        {activeTab === 'upload' && <FileUpload name={name} control={control} />}
        {activeTab === 'search' && <SearchComponent />}
      </div>
    </div>
  );
};

export default FileOrLinkTab;
