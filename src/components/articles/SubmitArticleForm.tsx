import React from 'react';

import { usePathname } from 'next/navigation';

import clsx from 'clsx';
import {
  Control,
  Controller,
  FieldErrors,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormRegister,
} from 'react-hook-form';

import FileUpload from '@/components/common/FileUpload';
import FormInput from '@/components/common/FormInput';
import MultiLabelSelector from '@/components/common/MultiLabelSelector';
import { SubmitArticleFormValues } from '@/types';

import SearchComponent from './SearchComponent';

interface SubmitArticleFormProps {
  handleSubmit: UseFormHandleSubmit<SubmitArticleFormValues>;
  onSubmit: SubmitHandler<SubmitArticleFormValues>;
  control: Control<SubmitArticleFormValues>;
  register: UseFormRegister<SubmitArticleFormValues>;
  errors: FieldErrors<SubmitArticleFormValues>;
  isPending: boolean;
  activeTab: 'upload' | 'search';
  setActiveTab: React.Dispatch<React.SetStateAction<'upload' | 'search'>>;
  onSearch: (query: string) => void;
}

const SubmitArticleForm: React.FC<SubmitArticleFormProps> = ({
  handleSubmit,
  onSubmit,
  control,
  register,
  errors,
  isPending,
  activeTab,
  setActiveTab,
  onSearch,
}) => {
  const pathname = usePathname();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
      {/* Select the tab to upload a file or search for an article */}
      <div className="mx-auto w-full rounded shadow">
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
          {activeTab === 'upload' && (
            <Controller
              name="pdfFiles"
              control={control}
              rules={{ required: 'PDF files are required' }}
              render={({}) => <FileUpload name={'pdfFiles'} control={control} />}
            />
          )}
          {activeTab === 'search' && <SearchComponent onSearch={onSearch} />}
        </div>
      </div>
      <FormInput<SubmitArticleFormValues>
        label="Title"
        name="title"
        type="text"
        placeholder="Enter the title of your article"
        register={register}
        requiredMessage="Title is required"
        minLengthValue={10}
        minLengthMessage="Title must be at least 10 characters"
        info="Please provide a clear and concise title for your article."
        errors={errors}
        readOnly={activeTab === 'search'}
      />
      {activeTab === 'search' && (
        <p className="text-sm text-gray-500">
          You cannot edit the title when searching for articles.
        </p>
      )}
      <Controller
        name="authors"
        control={control}
        rules={{ required: 'Authors are required' }}
        render={({ field: { onChange, value }, fieldState }) => (
          <MultiLabelSelector
            label="Authors"
            tooltipText="Select authors for the article."
            placeholder="Add Authors"
            creatable
            value={value}
            onChange={onChange}
            fieldState={fieldState}
            disabled={activeTab === 'search'}
          />
        )}
      />
      {activeTab === 'search' && (
        <p className="text-sm text-gray-500">
          You cannot edit the authors when searching for articles.
        </p>
      )}
      <FormInput<SubmitArticleFormValues>
        label="Abstract"
        name="abstract"
        type="text"
        placeholder="Enter the abstract of your article"
        register={register}
        requiredMessage="Abstract is required"
        info="Provide a brief summary of your article's content."
        errors={errors}
        textArea={true}
        readOnly={activeTab === 'search'}
      />
      {activeTab === 'search' && (
        <p className="text-sm text-gray-500">
          You cannot edit the abstract when searching for articles.
        </p>
      )}
      {/* Display Article Link if activeTab === 'search' */}
      {activeTab === 'search' && (
        <>
          <FormInput<SubmitArticleFormValues>
            label="Article Link"
            name="article_link"
            type="text"
            placeholder="Enter the link to the article"
            register={register}
            requiredMessage="Article link is required"
            info="Provide a link to the article you want to submit."
            errors={errors}
          />
        </>
      )}
      <Controller
        name="keywords"
        control={control}
        rules={{ required: 'Keywords are required' }}
        render={({ field, fieldState }) => (
          <MultiLabelSelector
            label="Keywords"
            tooltipText="Select keywords for the article."
            placeholder="Add Keywords"
            maxOptions={5}
            creatable
            {...field}
            fieldState={fieldState}
          />
        )}
      />
      {/* <Controller
        name="imageFile"
        control={control}
        rules={{ required: 'Image is required' }}
        render={({}) => (
          <ImageUpload
            control={control}
            name="imageFile"
            label="Image"
            info="Upload an image for the article"
          />
        )}
      /> */}
      <div className="mb-4 space-y-2">
        <label className="block text-sm font-medium text-gray-700">Submission Type</label>
        <Controller
          name="submissionType"
          control={control}
          render={({ field: { onChange, value } }) => (
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => onChange('Public')}
                className={`rounded-md px-4 py-2 ${value === 'Public' ? 'bg-gray-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Public
              </button>
              <button
                type="button"
                onClick={() => onChange('Private')}
                className={`rounded-md px-4 py-2 ${value === 'Private' ? 'bg-gray-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Private
              </button>
            </div>
          )}
        />
      </div>
      {/* add a note mentioning that the article will be submitted and reviewed by the community */}
      {/* Display this if pathname has community included in it */}
      {pathname?.includes('community') && (
        <p className="mt-2 text-gray-600">
          Note: The article will be submitted to the community for review and approval.
        </p>
      )}
      <button
        type="submit"
        className={clsx('mx-auto max-w-md rounded-md bg-green-500 px-4 py-2 text-white', {
          'cursor-not-allowed opacity-50': isPending,
        })}
      >
        {isPending ? 'Loading...' : 'Submit Article'}
      </button>
    </form>
  );
};

export default SubmitArticleForm;
