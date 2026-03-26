import React, { useState } from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface DisplayFAQsProps {
  faqs: FAQ[];
}

const DisplayFAQs: React.FC<DisplayFAQsProps> = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* Fixed by Codex on 2026-02-15
          Who: Codex
          What: Tokenize FAQ card colors.
          Why: Keep FAQ styling aligned with UI skins.
          How: Replace gray/white utilities with semantic tokens. */}
      <div className="space-y-4 rounded-lg bg-common-cardBackground p-6 shadow-md res-text-sm">
        <h2 className="mb-4 font-bold text-text-primary res-text-xl">Frequently Asked Questions</h2>
        {faqs.length === 0 && (
          <p className="my-4 text-text-secondary">No FAQs are added by the author yet.</p>
        )}
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-lg shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <button
              className="w-full p-4 text-left focus:outline-none"
              onClick={() => toggleFAQ(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="font-semibold text-text-primary res-text-base">Q{index + 1}:</div>
                  <p className="text-text-secondary">{faq.question}</p>
                </div>
                {openIndex === index ? (
                  <ChevronUp className="text-text-tertiary" />
                ) : (
                  <ChevronDown className="text-text-tertiary" />
                )}
              </div>
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4">
                <div className="flex items-start space-x-2 border-t border-common-contrast pt-2">
                  <div className="mt-0.5 font-medium text-text-primary res-text-sm">
                    A{index + 1}:
                  </div>
                  <p className="text-text-secondary">{faq.answer}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default DisplayFAQs;
