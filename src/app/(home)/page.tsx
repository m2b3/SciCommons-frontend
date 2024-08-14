'use client';

import Link from 'next/link';

import cookies from 'js-cookie';

import Banner from '@/components/common/Banner';
import Footer from '@/components/common/Footer';
import NavBar from '@/components/common/NavBar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordian';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';
import { faqs } from '@/constants/common.constants';

import GyroSlider from './GyroSlider';

const Home = () => {
  const words = [
    {
      text: 'Welcome',
    },
    {
      text: 'to',
    },
    {
      text: 'SciCommons.',
      className: 'text-green-500 dark:text-green-500',
    },
  ];

  console.log(cookies.get('accessToken'));
  console.log(cookies.get('refreshToken'));

  return (
    <div>
      <NavBar />
      <Banner />
      <div className="flex h-[calc(100vh-120px)] flex-col items-center justify-center bg-white-primary text-gray-900 md:h-[calc(100vh-60px)]">
        <TypewriterEffectSmooth words={words} />
        <p className="mb-6 max-w-3xl px-4 text-center text-xs text-gray-600 sm:text-base">
          Be part of the change. Join our open platform to review, rate, and access research freely.
          Improve research quality and accessibility with community-driven peer review.
        </p>
        <div className="flex flex-row items-center space-x-4">
          <Link href="/articles">
            <button className="h-10 w-40 rounded-xl border border-transparent bg-gray-900 text-sm text-gray-100">
              Explore
            </button>
          </Link>
          <Link href="/communities">
            <button className="h-10 w-40 rounded-xl border border-green-600 text-sm  text-gray-900">
              Visit Communities
            </button>
          </Link>
        </div>
      </div>
      <div className="h-fit w-full bg-functional-green/10 py-4">
        <div className="flex w-full flex-col items-center py-8">
          <span className="text-center text-xl font-bold text-text-primary md:text-2xl">
            Features
          </span>
          <span className="text-base text-text-secondary">Uniqueness of our platform</span>
        </div>
        <GyroSlider />
      </div>
      <div className="flex w-full flex-col items-center py-12">
        <span className="px-8 text-center text-xl font-bold text-text-primary md:text-2xl">
          We Have Answered Almost All Your Questions
        </span>
        <div className="mt-8 flex max-w-[720px] flex-col items-center p-4">
          <Accordion type="single" collapsible className="max-w-[600px]">
            {faqs.map((faq, i) => (
              <AccordionItem
                className="border-b border-gray-200 px-0 py-1"
                key={i}
                value={faq?.ques}
              >
                <AccordionTrigger className="w-full p-5" defaultIconNeeded={true}>
                  <span className="text-gray-700">{faq?.ques}</span>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-0">
                  <span className="text-gray-500">{faq?.ans}</span>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
