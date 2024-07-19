import React from 'react';

import Image from 'next/image';

import dayjs from 'dayjs';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

import { AssessorSchema } from '@/api/schemas';
import useIdenticon from '@/hooks/useIdenticons';

const AssessorVerdict = ({ assessor }: { assessor: AssessorSchema }) => {
  const imageData = useIdenticon(40);
  const getStatusStyle = () => {
    switch (assessor.approved) {
      case true:
        return 'bg-green-100 text-green-800';
      case false:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (assessor.approved) {
      case true:
        return <CheckCircle2 className="mr-1 h-4 w-4" />;
      case false:
        return <XCircle className="mr-1 h-4 w-4" />;
      default:
        return <Clock className="mr-1 h-4 w-4" />;
    }
  };

  return (
    <div className="mb-4 border-b border-gray-200 pb-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src={assessor.assessor.profile_pic_url || `data:image/png;base64,${imageData}`}
            alt={assessor.assessor.username}
            width={32}
            height={32}
            className="mr-3 h-10 w-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold">{assessor.assessor.username}</h3>
            <p className="text-sm text-gray-500">{dayjs(assessor.assessed_at).fromNow()}</p>
          </div>
        </div>
        <div className={`flex items-center rounded-full px-3 py-1 text-sm ${getStatusStyle()}`}>
          {getStatusIcon()}
          {status}
        </div>
      </div>
      <p className="text-gray-700">{assessor.comments}</p>
    </div>
  );
};

export default AssessorVerdict;
