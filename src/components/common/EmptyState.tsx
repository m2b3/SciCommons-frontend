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
    <div className="flex flex-col items-center justify-center rounded-lg bg-white-secondary p-8 text-gray-900">
      <div className="mb-4">
        {logo ? (
          typeof logo === 'string' ? (
            <Image src={logo} alt="Logo" width={64} height={64} />
          ) : (
            logo
          )
        ) : (
          <AlertCircle className="h-16 w-16 text-gray-500" />
        )}
      </div>
      <p className="text-center text-xl font-semibold">{content}</p>
      {subcontent && (
        <div
          className="mt-2 text-center text-sm"
          dangerouslySetInnerHTML={{ __html: subcontent }}
        />
      )}
    </div>
  );
};

export default EmptyState;
