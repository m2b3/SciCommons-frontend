import Image from 'next/image';

import DOMPurify from 'dompurify';
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
    <div className="flex flex-col items-center justify-center rounded-xl bg-common-cardBackground p-8 text-text-secondary">
      <div className="mb-4">
        {logo ? (
          typeof logo === 'string' ? (
            <Image src={logo} alt="Logo" width={64} height={64} />
          ) : (
            logo
          )
        ) : (
          <AlertCircle className="h-16 w-16 text-text-tertiary" />
        )}
      </div>
      <p className="text-center text-xl font-semibold text-text-tertiary">{content}</p>
      {subcontent && (
        <div
          className="mt-2 text-center text-sm text-text-tertiary"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(subcontent) }}
        />
      )}
    </div>
  );
};

export default EmptyState;
