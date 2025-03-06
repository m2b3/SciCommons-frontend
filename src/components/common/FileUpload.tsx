import React from 'react';

import clsx from 'clsx';
import { CheckCircle, Upload, XCircle } from 'lucide-react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { Control, FieldValues, Path, PathValue, useController } from 'react-hook-form';
import { toast } from 'sonner';

import { FileObj } from '@/types';

interface FileUploadProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
}

const FileUpload = <TFieldValues extends FieldValues>({
  control,
  name,
}: FileUploadProps<TFieldValues>) => {
  const MAX_FILES = 2; // Maximum number of files that can be uploaded
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // Maximum file size in bytes

  const {
    field: { onChange, value: fileObjs },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: [] as PathValue<TFieldValues, Path<TFieldValues>>,
  });

  const onDrop = (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileObjs.length >= MAX_FILES) {
      toast.error(`You can only upload a maximum of ${MAX_FILES} files.`, {
        duration: 2000,
        position: 'top-right',
      });
      return;
    }

    const newFileObjs: FileObj[] = acceptedFiles.map((file) => {
      // Check for duplicate files
      const isDuplicate: boolean = fileObjs.some(
        (existingFile: FileObj) =>
          existingFile.file.name === file.name && existingFile.file.size === file.size
      );

      if (isDuplicate) {
        return { file, progress: 0, status: 'error', errorMessage: 'File already uploaded' };
      } else if (file.size > MAX_FILE_SIZE) {
        return { file, progress: 0, status: 'error', errorMessage: 'File size exceeds 2 MB' };
      } else {
        return { file, progress: 0, status: 'uploading' };
      }
    });

    const rejectedFileObjs: FileObj[] = fileRejections.map((rejection) => ({
      file: rejection.file,
      progress: 0,
      status: 'error',
      errorMessage: `Invalid file or file size exceeds ${MAX_FILE_SIZE / 1024 / 1024} MB`,
    }));

    const updatedFileObjs = [...fileObjs, ...newFileObjs, ...rejectedFileObjs].slice(0, MAX_FILES); // Ensure we don't exceed MAX_FILES
    onChange(updatedFileObjs);

    newFileObjs.forEach((fileObj) => {
      if (fileObj.status === 'uploading') {
        uploadFile(fileObj, updatedFileObjs);
      }
    });
  };

  const uploadFile = (fileObj: FileObj, allFileObjs: FileObj[]) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setTimeout(() => {
        const updatedFileObjs = allFileObjs.map((obj) =>
          obj === fileObj ? { ...obj, progress: 100, status: 'completed' } : obj
        );
        onChange(updatedFileObjs);
      }, 1000);
    };
    reader.onerror = () => {
      const updatedFileObjs = allFileObjs.map((obj) =>
        obj === fileObj ? { ...obj, status: 'error', errorMessage: 'Upload failed' } : obj
      );
      onChange(updatedFileObjs);
    };
    reader.readAsArrayBuffer(fileObj.file);

    const uploadSimulation = () => {
      let progress = 0;
      const interval = setInterval(() => {
        if (progress < 90) {
          progress += 10;
          const updatedFileObjs = allFileObjs.map((obj) =>
            obj === fileObj ? { ...obj, progress } : obj
          );
          onChange(updatedFileObjs);
        } else {
          clearInterval(interval);
        }
      }, 100);
    };

    uploadSimulation();
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'application/pdf': [] },
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  return (
    <div className="w-full text-gray-900">
      <div
        {...getRootProps()}
        className={clsx(
          'cursor-pointer rounded-md border-2 border-dashed border-gray-300 p-6 text-center transition-colors duration-200 ease-in-out hover:bg-gray-100',
          {
            'border-red-500': error,
            'cursor-not-allowed opacity-50': fileObjs.length >= MAX_FILES,
          }
        )}
      >
        <input {...getInputProps()} disabled={fileObjs.length >= MAX_FILES} />
        <Upload className="mx-auto mb-2" size={48} />
        <p>Choose files or drag & drop them here</p>
        <p className="text-sm text-gray-500">PDF format, up to 10 MB each</p>
        <p className="text-sm text-gray-500">Maximum {MAX_FILES} files</p>
        <button
          type="button"
          className={clsx('mt-2 rounded-md bg-blue-500 px-4 py-2 text-gray-900', {
            'cursor-not-allowed opacity-50': fileObjs.length >= MAX_FILES,
          })}
          disabled={fileObjs.length >= MAX_FILES}
        >
          Browse Files
        </button>
      </div>
      <div className="mt-4">
        {fileObjs &&
          fileObjs.map((fileObj: FileObj, index: number) => (
            <div key={index} className="mb-2 flex items-center">
              <div className="w-12 flex-shrink-0">
                {fileObj.status === 'error' ? <XCircle size={24} className="text-red-500" /> : null}
              </div>
              <div className="ml-2 flex-1">
                <div className="flex justify-between text-sm">
                  <span>{fileObj.file.name}</span>
                  <span>
                    {fileObj.status === 'uploading'
                      ? `${fileObj.progress}%`
                      : fileObj.status === 'error'
                        ? fileObj.errorMessage
                        : 'Completed'}
                  </span>
                </div>
                <div className="mt-1 h-2 rounded bg-gray-200">
                  <div
                    className={`h-2 rounded ${fileObj.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${fileObj.progress}%` }}
                  ></div>
                </div>
              </div>
              {fileObj.status === 'completed' && (
                <CheckCircle size={24} className="ml-2 text-green-500" />
              )}
            </div>
          ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

export default FileUpload;
