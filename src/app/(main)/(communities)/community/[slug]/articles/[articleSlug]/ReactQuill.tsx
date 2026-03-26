// Todo: Remove this component later
'use client';

import React, { useState } from 'react';

import dynamic from 'next/dynamic';

import 'react-quill/dist/quill.snow.css';

// Dynamically import react-quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const ReactQuillEditor: React.FC = () => {
  const [value, setValue] = useState('');

  /* Fixed by Codex on 2026-02-15
     Problem: Community ReactQuill stub used fixed gray/blue utilities.
     Solution: Swap to semantic tokens for text and accents.
     Result: Stub UI now tracks skin palettes. */
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="mb-4">
        <nav className="flex space-x-4 border-b">
          <button className="border-b-2 border-functional-blue px-4 py-2 font-semibold text-text-secondary">
            Reviews
          </button>
          <button className="px-4 py-2 font-semibold text-text-secondary">Discussions</button>
          <button className="px-4 py-2 font-semibold text-text-secondary">FAQ</button>
        </nav>
      </div>
      <div className="mb-4">
        <label htmlFor="review" className="mb-2 block font-bold text-text-secondary">
          Your review
        </label>
        <ReactQuill value={value} onChange={setValue} placeholder="Start typing your review" />
      </div>
      <button className="rounded bg-functional-blue px-4 py-2 font-semibold text-primary-foreground">
        Post Your Review
      </button>
      <p className="mt-4 text-sm text-text-tertiary">
        By clicking Post Your Review, you agree to our{' '}
        <a href="#" className="text-functional-blue hover:text-functional-blueContrast">
          terms of service
        </a>{' '}
        and{' '}
        <a href="#" className="text-functional-blue hover:text-functional-blueContrast">
          privacy policy
        </a>
        .
      </p>
    </div>
  );
};

export default ReactQuillEditor;
