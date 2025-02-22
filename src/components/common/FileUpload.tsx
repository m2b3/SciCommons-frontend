import React from 'react';

import clsx from 'clsx';
import { Check, Upload, X } from 'lucide-react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { Control, FieldValues, Path, PathValue, useController } from 'react-hook-form';
import { toast } from 'sonner';

import { cn, formatFileSize } from '@/lib/utils';
import { FileObj } from '@/types';

import { Button, ButtonTitle } from '../ui/button';

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
      toast.error(`You can only upload a maximum of ${MAX_FILES} files.`, { duration: 5000 });
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

  const removeFile = (indexToRemove: number) => {
    const updatedFiles = fileObjs.filter((_: FileObj, index: number) => index !== indexToRemove);
    onChange(updatedFiles);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'application/pdf': [] },
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    disabled: fileObjs.length >= MAX_FILES,
  });

  return (
    <div className="w-full text-gray-900">
      <div
        {...getRootProps()}
        className={clsx(
          'cursor-pointer rounded-xl border border-dashed border-common-contrast bg-common-cardBackground p-6 text-center transition-colors duration-200 ease-in-out hover:bg-common-background/20 md:bg-common-background',
          {
            'border-functional-red': error,
            'cursor-not-allowed opacity-50': fileObjs.length >= MAX_FILES,
          }
        )}
      >
        <input {...getInputProps()} disabled={fileObjs.length >= MAX_FILES} />
        <Upload className="mx-auto mb-2 text-text-secondary" size={48} />
        <p className="text-sm text-text-secondary">Choose files or drag & drop them here</p>
        <p className="text-xs text-text-tertiary">PDF format, up to 10 MB each</p>
        <p className="text-xs text-text-tertiary">Maximum {MAX_FILES} files</p>
        <Button
          variant={'blue'}
          type="button"
          className={cn('mt-2', {
            'cursor-not-allowed opacity-50': fileObjs.length >= MAX_FILES,
          })}
          disabled={fileObjs.length >= MAX_FILES}
        >
          <ButtonTitle>Browse Files</ButtonTitle>
        </Button>
      </div>
      <div className="mt-4">
        {fileObjs &&
          fileObjs.map((fileObj: FileObj, index: number) => (
            <div key={index} className="mb-2 flex items-center gap-2">
              <div className="flex-1 rounded-md bg-common-minimal/50 px-4 py-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {fileObj.status === 'completed' ? (
                      <Check size={18} className="shrink-0 text-functional-green" />
                    ) : fileObj.status === 'error' ? (
                      <X size={18} className="shrink-0 text-functional-red" />
                    ) : null}
                    <span className="text-sm text-text-secondary">{fileObj.file.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={cn('text-xs text-text-tertiary', {
                        'text-functional-red': fileObj.status === 'error',
                        'text-functional-blue': fileObj.status == 'uploading',
                      })}
                    >
                      {fileObj.status === 'uploading'
                        ? `${fileObj.progress}%`
                        : fileObj.status === 'error'
                          ? fileObj.errorMessage
                          : formatFileSize(fileObj.file.size)}
                    </span>
                    {fileObj.status === 'completed' && (
                      <X
                        size={18}
                        className="ml-2 shrink-0 cursor-pointer text-text-tertiary hover:text-text-primary"
                        onClick={() => removeFile(index)}
                      />
                    )}
                  </div>
                </div>
                {fileObj.status === 'completed' ? null : (
                  <div className="mt-1 h-1 rounded bg-common-minimal">
                    <div
                      className={`h-1 rounded bg-functional-blue`}
                      style={{ width: `${fileObj.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
      {error && <p className="mt-1 text-sm text-functional-red">{error.message}</p>}
    </div>
  );
};

export default FileUpload;
