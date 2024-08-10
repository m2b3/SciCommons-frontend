import Image from 'next/image';

import { AlertCircle } from 'lucide-react';

const EmptyState = ({
  logo,
  content,
  subcontent,
}: {
  logo?: string | React.ReactNode;
  content: string;
  subcontent?: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg p-8 dark:bg-gray-800">
      <div className="mb-4">
        {logo ? (
          typeof logo === 'string' ? (
            <Image src={logo} alt="Logo" width={64} height={64} />
          ) : (
            logo
          )
        ) : (
          <AlertCircle className="h-16 w-16 text-gray-400 dark:text-gray-500" />
        )}
      </div>
      <p className="text-center text-xl font-semibold text-gray-700 dark:text-gray-200">
        {content}
      </p>
      {subcontent && (
        <div
          className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400"
          dangerouslySetInnerHTML={{ __html: subcontent }}
        />
      )}
    </div>
  );
};

export default EmptyState;
