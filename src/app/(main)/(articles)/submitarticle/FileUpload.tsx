import { CheckCircle, Upload, XCircle } from 'lucide-react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { Control, FieldValues, Path, useController } from 'react-hook-form';

interface FileUploadProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
}

interface FileObj {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

const FileUpload = <TFieldValues extends FieldValues>({
  control,
  name,
}: FileUploadProps<TFieldValues>) => {
  const {
    field: { onChange, value: fileObj },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: { required: 'A PDF file is required' },
    defaultValue: undefined,
  });

  const onDrop = (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 2 * 1024 * 1024) {
        onChange({ file, progress: 0, status: 'error', errorMessage: 'File size exceeds 2 MB' });
      } else {
        const newFileObj: FileObj = { file, progress: 0, status: 'uploading' };
        onChange(newFileObj);
        uploadFile(newFileObj);
      }
    }

    if (fileRejections.length > 0) {
      const file = fileRejections[0].file;
      onChange({ file, progress: 0, status: 'error', errorMessage: 'Invalid file type' });
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

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'application/pdf': [] },
    maxSize: 2 * 1024 * 1024,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className="rounded-md border-2 border-dashed border-gray-300 p-6 text-center"
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-2" size={48} />
        <p>Choose a file or drag & drop it here</p>
        <p className="text-sm text-gray-500">PDF format, up to 2 MB</p>
        <button type="button" className="mt-2 rounded-md bg-blue-500 px-4 py-2 text-white">
          Browse File
        </button>
      </div>
      <div className="mt-4">
        {fileObj && (
          <div className="mb-2 flex items-center">
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
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

export default FileUpload;
