// Todo: Remove this component later
'use client';

import React, { useState } from 'react';

import dynamic from 'next/dynamic';

import 'react-quill/dist/quill.snow.css';

// Todo: Remove this component later

// Todo: Remove this component later

// Todo: Remove this component later

// Todo: Remove this component later

// Todo: Remove this component later

// Todo: Remove this component later

// Todo: Remove this component later

// Todo: Remove this component later

// Todo: Remove this component later

// Dynamically import react-quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const ReactQuillEditor: React.FC = () => {
  const [value, setValue] = useState('');

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="mb-4">
        <nav className="flex space-x-4 border-b">
          <button className="border-b-2 border-blue-500 px-4 py-2 font-semibold text-gray-600">
            Reviews
          </button>
          <button className="px-4 py-2 font-semibold text-gray-600">Discussions</button>
          <button className="px-4 py-2 font-semibold text-gray-600">FAQ</button>
        </nav>
      </div>
      <div className="mb-4">
        <label htmlFor="review" className="mb-2 block font-bold text-gray-700">
          Your review
        </label>
        <ReactQuill value={value} onChange={setValue} placeholder="Start typing your review" />
      </div>
      <button className="rounded bg-blue-500 px-4 py-2 font-semibold text-white">
        Post Your Review
      </button>
      <p className="mt-4 text-sm text-gray-500">
        By clicking Post Your Review, you agree to our{' '}
        <a href="#" className="text-blue-500">
          terms of service
        </a>{' '}
        and{' '}
        <a href="#" className="text-blue-500">
          privacy policy
        </a>
        .
      </p>
    </div>
  );
};

export default ReactQuillEditor;
