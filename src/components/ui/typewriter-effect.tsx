'use client';

import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(''),
    };
  });
  const renderWords = () => {
    return (
      <>
        <div className="hidden md:inline">
          {wordsArray.map((word, idx) => {
            return (
              <div key={`word-${idx}`} className="inline-block">
                {word.text.map((char, index) => (
                  <span
                    key={`char-${index}`}
                    className={cn(
                      `text-2xl text-text-primary sm:text-4xl md:text-5xl lg:text-6xl`,
                      word.className
                    )}
                  >
                    {char}
                  </span>
                ))}
                &nbsp;
              </div>
            );
          })}
        </div>
        <div className="inline md:hidden">
          <div className="inline-block">
            {wordsArray[wordsArray.length - 1].text.map((char, index) => (
              <span
                key={`char-${index}`}
                className={cn(
                  `text-4xl text-text-primary sm:text-5xl`,
                  wordsArray[wordsArray.length - 1].className
                )}
              >
                {char}
              </span>
            ))}
            &nbsp;
          </div>
        </div>
      </>
    );
  };

  return (
    <div className={cn('mb-6 flex space-x-1', className)}>
      <motion.div
        className="overflow-hidden pb-2"
        initial={{
          width: '0%',
        }}
        whileInView={{
          width: 'fit-content',
        }}
        transition={{
          duration: 2,
          ease: 'linear',
          delay: 1,
        }}
      >
        <div
          className="lg:text:3xl text-xs font-bold sm:text-base md:text-xl xl:text-5xl"
          style={{
            whiteSpace: 'nowrap',
          }}
        >
          {renderWords()}{' '}
        </div>{' '}
      </motion.div>
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,

          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className={cn(
          'block h-9 w-0.5 rounded-sm bg-functional-green sm:h-12 md:h-12 lg:h-14',
          cursorClassName
        )}
      />
    </div>
  );
};
