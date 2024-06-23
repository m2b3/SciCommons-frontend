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

  // const [url, setUrl] = useState<string>('');
  // const [urlError, setUrlError] = useState<string | null>(null);

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
    // Assume a FileReader to simulate the upload process
    const reader = new FileReader();
    reader.onloadend = () => {
      // Simulate upload completion
      setTimeout(() => {
        onChange({ ...fileObj, progress: 100, status: 'completed' });
      }, 1000);
    };
    reader.onerror = () => {
      onChange({ ...fileObj, status: 'error', errorMessage: 'Upload failed' });
    };
    reader.readAsArrayBuffer(fileObj.file);

    // Simulate upload progress
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

  // const handleUrlUpload = () => {
  //   if (!url) {
  //     setUrlError('Please enter a valid URL.');
  //     return;
  //   }

  //   axios
  //     .get(url, { responseType: 'blob' })
  //     .then((response) => {
  //       const file = new File([response.data], 'image_from_url', { type: response.data.type });
  //       if (file.size > 2 * 1024 * 1024) {
  //         setFileObj({
  //           file,
  //           progress: 0,
  //           status: 'error',
  //           errorMessage: 'File size exceeds 2 MB',
  //         });
  //       } else {
  //         const newFileObj: FileObj = { file, progress: 0, status: 'uploading' };
  //         setFileObj(newFileObj);
  //         uploadFile(newFileObj);
  //       }
  //     })
  //     .catch(() => {
  //       setUrlError('Failed to fetch the image from URL.');
  //     });
  // };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/png': [], 'image/jpeg': [], 'image/jpg': [], 'image/webp': [] },
    maxSize: 2 * 1024 * 1024,
  });

  return (
    <div className="mt-4 w-full rounded bg-white">
      <LabeledTooltip label={label} info={info} />
      <div
        {...getRootProps()}
        // if there is an error make the border red
        className={clsx(
          'cursor-pointer rounded-md border-2 border-dashed border-gray-300 p-6 text-center transition-colors duration-200 ease-in-out hover:bg-gray-100',
          {
            'border-red-500': error,
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
            <p className="text-center">
              Drop your image to replace or{' '}
              <span className="cursor-pointer text-blue-500">Browse</span>
            </p>
            <p className="text-sm text-gray-500">Supports: PNG, JPG, JPEG, WEBP</p>
          </div>
        ) : (
          <>
            <Image src="/imageupload.png" width={64} height={64} className="mx-auto" alt="Upload" />
            <p>
              Drop your image here, or <span className="cursor-pointer text-blue-500">Browse</span>
            </p>
            <p className="text-sm text-gray-500">Supports: PNG, JPG, JPEG, WEBP</p>
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
            {fileObj.status === 'error' && <CircleX size={24} className="ml-2 text-red-500" />}
          </div>
        </div>
      )}
      {/* <div className="mt-4 text-center">or</div>
      <div className="mt-4 flex items-center">
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setUrlError(null);
          }}
          placeholder="Add file URL"
          className="mr-2 flex-1 rounded border p-2"
        />
        <button onClick={handleUrlUpload} className="rounded bg-gray-500 px-4 py-2 text-white">
          Upload
        </button>
      </div>
      {urlError && <div className="mt-2 text-sm text-red-500">{urlError}</div>} */}
      {error && <div className="mt-2 text-sm text-red-500">{error.message}</div>}
    </div>
  );
};

export default ImageUpload;
