import { useEffect, useRef, useState } from 'react';

const TruncateText = ({
  text,
  maxLines,
  hideButton = false,
}: {
  text: string;
  maxLines: number;
  hideButton?: boolean;
}) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        const lineHeight = parseInt(window.getComputedStyle(textRef.current).lineHeight);
        const maxHeight = lineHeight * maxLines;
        setIsTruncated((textRef.current as HTMLElement).scrollHeight > maxHeight);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [maxLines, text]);

  return (
    <div>
      <p
        ref={textRef}
        className={`${
          !isExpanded && isTruncated ? `line-clamp-${maxLines}` : ''
        } text-gray-700 dark:text-gray-300`}
      >
        {text}
      </p>
      {isTruncated && !hideButton && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
};

export default TruncateText;
