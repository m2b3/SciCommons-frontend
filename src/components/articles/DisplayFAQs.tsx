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
      <h2 className="text-text-900 mb-4 font-bold res-text-xl">Frequently Asked Questions</h2>
      {faqs.length === 0 && (
        <p className="text-text-700 my-4">No FAQs are added by the author yet.</p>
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
                <div className="text-text-900 font-semibold res-text-base">Q{index + 1}:</div>
                <p className="text-text-700">{faq.question}</p>
              </div>
              {openIndex === index ? (
                <ChevronUp className="text-text-500" />
              ) : (
                <ChevronDown className="text-text-500" />
              )}
            </div>
          </button>
          {openIndex === index && (
            <div className="px-4 pb-4">
              <div className="flex items-start space-x-2 border-t border-gray-200 pt-2">
                <div className="text-text-800 mt-0.5 font-medium res-text-sm">A{index + 1}:</div>
                <p className="text-text-600">{faq.answer}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DisplayFAQs;
