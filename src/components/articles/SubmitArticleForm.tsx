import React from 'react';


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
import { cn } from '@/lib/utils';
import { SubmitArticleFormValues } from '@/types';

import PdfIcon from '../ui/Icons/PdfIcon';
import { Button, ButtonTitle } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
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
  showPrivateCheckOption?: boolean;
  articleData: any;
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
  showPrivateCheckOption = false,
  articleData,
}) => {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Select the tab to upload a file or search for an article */}
      <div className="mx-auto w-full">
        <div className="flex border-b border-common-minimal">
          <button
            className={`flex-1 py-2 text-center transition-all duration-300 ${activeTab === 'upload' ? 'border-b-2 border-functional-green text-functional-green' : 'text-text-secondary'}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('upload');
            }}
            type="button"
          >
            Upload
          </button>
          <button
            className={`flex-1 py-2 text-center transition-all duration-300 ${activeTab === 'search' ? 'border-b-2 border-functional-green text-functional-green' : 'text-text-secondary'}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('search');
            }}
            type="button"
          >
            Search
          </button>
        </div>
        <div className="mt-4 transition-all duration-300">
          {activeTab === 'upload' && (
            <Controller
              name="pdfFiles"
              control={control}
              // rules={{ required: 'PDF files are required' }}
              render={({}) => <FileUpload name={'pdfFiles'} control={control} />}
            />
          )}
          {activeTab === 'search' && <SearchComponent onSearch={onSearch} />}
        </div>
      </div>
      <div>
        <FormInput<SubmitArticleFormValues>
          label="Title"
          name="title"
          type="text"
          placeholder="Enter the title of your article"
          register={register}
          requiredMessage="Title is required"
          minLengthValue={5}
          minLengthMessage="Title must be at least 5 characters"
          maxLengthValue={500}
          maxLengthMessage="Title cannot exceed 500 characters"
          info="Please provide a clear and concise title for your article."
          errors={errors}
          readOnly={activeTab === 'search'}
        />
        {activeTab === 'search' && (
          <p className="mt-2 text-xs italic text-text-tertiary">
            You cannot edit the title when searching for articles.
          </p>
        )}
      </div>
      <div>
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
          <p className="mt-2 text-xs italic text-text-tertiary">
            You cannot edit the authors when searching for articles.
          </p>
        )}
      </div>
      <div>
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
          <p className="mt-2 text-xs italic text-text-tertiary">
            You cannot edit the abstract when searching for articles.
          </p>
        )}
      </div>
      {/* Display Article Link if activeTab === 'search' */}
      {activeTab === 'search' && (
        <div>
          <FormInput<SubmitArticleFormValues>
            label="Article Link"
            name="article_link"
            type="text"
            placeholder="Enter the link to the article"
            register={register}
            requiredMessage="Article link is required"
            info="Provide a link to the article you want to submit."
            errors={errors}
            readOnly={activeTab === 'search'}
            maxLengthMessage="Article link cannot exceed 2000 characters"
            maxLengthValue={2000}
          />
          <p className="mt-2 text-xs italic text-text-tertiary">
            You cannot edit the article link when searching for articles.
          </p>
        </div>
      )}
      {/* <Controller
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
      /> */}
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
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-secondary">Submission Type</label>
        <Controller
          name="submissionType"
          control={control}
          render={({ field: { onChange, value } }) => (
            <div className="flex flex-col gap-4">
              <div className="mt-1 flex gap-2">
                <Button
                  className={cn(
                    'w-fit cursor-pointer rounded-lg border px-4 py-2',
                    value === 'Public'
                      ? 'border-functional-green bg-functional-green/10'
                      : 'border-common-contrast'
                  )}
                  type="button"
                  variant={'outline'}
                  onClick={() => onChange('Public')}
                >
                  <ButtonTitle className="text-base">Public</ButtonTitle>
                </Button>
                {/* <Button
                className={cn(
                  'w-fit cursor-pointer rounded-lg border px-4 py-2',
                  value === 'Private'
                    ? 'border-functional-green bg-functional-green/10'
                    : 'border-common-contrast'
                )}
                type="button"
                variant={'outline'}
                onClick={() => onChange('Private')}
              >
                <ButtonTitle className="text-base">Private</ButtonTitle>
              </Button> */}
              </div>
              {showPrivateCheckOption && value === 'Public' && (
                <p className="text-sm italic text-functional-yellow">
                  (Article will be submitted to the community and visible publicly.)
                </p>
              )}
              {showPrivateCheckOption && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    onCheckedChange={(checked) => onChange(checked ? 'Private' : 'Public')}
                    checked={value === 'Private'}
                  />
                  <span className="text-sm text-text-secondary">
                    Submit the article exclusively to the community (if the community is public, it
                    will be visible to everyone).
                  </span>
                </div>
              )}
            </div>
          )}
        />
      </div>
      {activeTab === 'search' && articleData?.pdfLink && (
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium text-text-secondary">PDF</label>
          <a
            href={articleData?.pdfLink}
            target="_blank"
            className="text-functional-green hover:underline"
          >
            <PdfIcon className="mt-1 size-8 shrink-0 cursor-pointer" />
          </a>
        </div>
      )}
      <Button
        showLoadingSpinner={false}
        loading={isPending}
        className="mx-auto mt-4 w-full"
        type="submit"
      >
        <ButtonTitle>{isPending ? 'Loading...' : 'Submit Article'}</ButtonTitle>
      </Button>
    </form>
  );
};

export default SubmitArticleForm;
