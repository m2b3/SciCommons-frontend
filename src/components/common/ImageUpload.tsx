import Image from 'next/image';

import clsx from 'clsx';
import { CheckCircle, CircleX } from 'lucide-react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { Control, FieldValues, Path, useController } from 'react-hook-form';

import { FileObj } from '@/types';

import LabeledTooltip from './LabeledToolTip';

interface ImageUploadProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  info: string;
  defaultImageURL?: string;
}

const ImageUpload = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  info,
  defaultImageURL,
}: ImageUploadProps<TFieldValues>) => {
  const {
    field: { onChange, value: fileObj },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: undefined,
  });

  const onDrop = (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 2 * 1024 * 1024) {
        onChange({
          file,
          progress: 0,
          status: 'error',
          errorMessage: 'File size exceeds 2 MB',
        } as FileObj);
      } else {
        const newFileObj: FileObj = { file, progress: 0, status: 'uploading' };
        onChange(newFileObj);
        uploadFile(newFileObj);
      }
    }

    if (fileRejections.length > 0) {
      const file = fileRejections[0].file;
      onChange({
        file,
        progress: 0,
        status: 'error',
        errorMessage: 'File either exceeds 2 MB or is not an image',
      } as FileObj);
    }
  };

  const uploadFile = (fileObj: FileObj) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setTimeout(() => {
        onChange({ ...fileObj, progress: 100, status: 'completed' });
      }, 1000);
    };
    reader.onerror = () => {
      onChange({ ...fileObj, status: 'error', errorMessage: 'Upload failed' });
    };
    reader.readAsArrayBuffer(fileObj.file);

    const uploadSimulation = () => {
      let progress = 0;
      const interval = setInterval(() => {
        if (progress < 90) {
          progress += 10;
          onChange({ ...fileObj, progress });
        } else {
          clearInterval(interval);
        }
      }, 100);
    };

    uploadSimulation();
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/png': [], 'image/jpeg': [], 'image/jpg': [], 'image/webp': [] },
    maxSize: 2 * 1024 * 1024,
  });

  return (
    <div className="mt-4 w-full rounded bg-white dark:bg-gray-800">
      <LabeledTooltip label={label} info={info} />
      <div
        {...getRootProps()}
        className={clsx(
          'cursor-pointer rounded-md border-2 border-dashed border-gray-300 p-6 text-center transition-colors duration-200 ease-in-out hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700',
          {
            'border-red-500 dark:border-red-400': error,
          }
        )}
      >
        <input {...getInputProps()} />
        {defaultImageURL ? (
          <div className="flex flex-col items-center">
            <Image
              src={defaultImageURL}
              width={128}
              height={128}
              className="mb-4 rounded"
              alt="Default"
            />
            <p className="text-center dark:text-gray-300">
              Drop your image to replace or{' '}
              <span className="cursor-pointer text-blue-500 dark:text-blue-400">Browse</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supports: PNG, JPG, JPEG, WEBP
            </p>
          </div>
        ) : (
          <>
            <Image src="/imageupload.png" width={64} height={64} className="mx-auto" alt="Upload" />
            <p className="dark:text-gray-300">
              Drop your image here, or{' '}
              <span className="cursor-pointer text-blue-500 dark:text-blue-400">Browse</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supports: PNG, JPG, JPEG, WEBP
            </p>
          </>
        )}
      </div>
      {fileObj && (
        <div className="mt-4">
          <div className="mb-2 flex items-center">
            <Image
              src={URL.createObjectURL(fileObj.file)}
              alt="Preview"
              width={48}
              height={48}
              className="mr-2 rounded"
            />
            <div className="flex-1">
              <div className="flex justify-between text-sm dark:text-gray-300">
                <span>{fileObj.file.name}</span>
                <span>
                  {fileObj.status === 'uploading'
                    ? `${fileObj.progress}%`
                    : fileObj.status === 'error'
                      ? fileObj.errorMessage
                      : 'Completed'}
                </span>
              </div>
              <div className="mt-1 h-2 rounded bg-gray-200 dark:bg-gray-600">
                <div
                  className={`h-2 rounded ${fileObj.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${fileObj.progress}%` }}
                ></div>
              </div>
            </div>
            {fileObj.status === 'completed' && (
              <CheckCircle size={24} className="ml-2 text-green-500" />
            )}
            {fileObj.status === 'error' && <CircleX size={24} className="ml-2 text-red-500" />}
          </div>
        </div>
      )}
      {error && <div className="mt-2 text-sm text-red-500 dark:text-red-400">{error.message}</div>}
    </div>
  );
};

export default ImageUpload;
