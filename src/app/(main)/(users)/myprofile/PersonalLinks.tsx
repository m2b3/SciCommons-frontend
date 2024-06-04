import React from 'react';

interface PersonalLinksProps {
  homePage: string;
  linkedIn: string;
  github: string;
  googleScholar: string;
}

const PersonalLinks: React.FC<PersonalLinksProps> = ({
  homePage,
  linkedIn,
  github,
  googleScholar,
}) => {
  return (
    <div className="mx-auto mt-6 max-w-4xl rounded-lg bg-white p-6 shadow-md">
      <h2 className="text-2xl font-bold">Personal Links</h2>
      <p className="mt-2 text-gray-600">
        These are the professional profiles you have provided. We have verified them to ensure the
        legitimacy of your account.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-gray-700">Home Page URL</label>
          <input
            type="text"
            value={homePage}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            readOnly
          />
        </div>
        <div>
          <label className="block text-gray-700">LinkedIn URL</label>
          <input
            type="text"
            value={linkedIn}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            readOnly
          />
        </div>
        <div>
          <label className="block text-gray-700">Github URL</label>
          <input
            type="text"
            value={github}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            readOnly
          />
        </div>
        <div>
          <label className="block text-gray-700">GoogleScholar URL</label>
          <input
            type="text"
            value={googleScholar}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalLinks;
