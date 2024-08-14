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
    <div className="space-y-4 rounded-lg bg-white-secondary p-6 shadow-md res-text-sm">
      <h2 className="mb-4 font-bold text-gray-900 res-text-xl">Frequently Asked Questions</h2>
      {faqs.length === 0 && (
        <p className="my-4 text-gray-700">No FAQs are added by the author yet.</p>
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
                <div className="font-semibold text-gray-900 res-text-base">Q{index + 1}:</div>
                <p className="text-gray-700">{faq.question}</p>
              </div>
              {openIndex === index ? (
                <ChevronUp className="text-gray-500" />
              ) : (
                <ChevronDown className="text-gray-500" />
              )}
            </div>
          </button>
          {openIndex === index && (
            <div className="px-4 pb-4">
              <div className="flex items-start space-x-2 border-t border-gray-200 pt-2">
                <div className="mt-0.5 font-medium text-gray-800 res-text-sm">A{index + 1}:</div>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DisplayFAQs;
