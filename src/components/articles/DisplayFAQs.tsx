import React from 'react';

interface FAQ {
  question: string;
  answer: string;
}

interface DisplayFAQsProps {
  faqs: FAQ[];
}

const DisplayFAQs: React.FC<DisplayFAQsProps> = ({ faqs }) => {
  return (
    <div className="space-y-4 rounded-lg bg-gray-100 p-4 shadow-md">
      {faqs.length === 0 && (
        <p className="my-4 text-gray-700">No FAQs are added by the author yet.</p>
      )}
      {faqs.map((faq, index) => (
        <div key={index} className="rounded-lg bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center space-x-2">
            <div className="text-lg font-semibold text-gray-900">Q{index + 1}:</div>
            <p className="text-gray-700">{faq.question}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-md font-medium text-gray-800">A{index + 1}:</div>
            <p className="text-gray-600">{faq.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DisplayFAQs;
