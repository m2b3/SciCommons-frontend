import React from 'react';

interface ProfessionalStatusProps {
  email: string;
  startYear: string;
  endYear: string;
}

const ProfessionalStatus: React.FC<ProfessionalStatusProps> = ({ email, startYear, endYear }) => {
  return (
    <div className="mx-auto mt-6 max-w-4xl rounded-lg bg-white p-6 shadow-md">
      <h2 className="text-2xl font-bold">Academic or Professional Status</h2>
      <p className="mt-2 text-gray-600">
        This is the academic or professional status you have provided. It helps us ensure that the
        content on our platform is relevant and of high quality.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <input
            type="text"
            value={email}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            readOnly
          />
        </div>
        <div>
          <input
            type="text"
            value={startYear}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            readOnly
          />
        </div>
        <div>
          <input
            type="text"
            value={endYear}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default ProfessionalStatus;
