'use client';

import Image from 'next/image';
import Link from 'next/link';

import Footer from '@/components/common/Footer';
import NavBar from '@/components/common/NavBar';
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from '@/components/ui/accordian';
import { Button, ButtonTitle } from '@/components/ui/button';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';

// import { faqs } from '@/constants/common.constants';

// import FeaturesSection from './FeaturesSection';

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
      className: 'text-functional-green',
    },
  ];

  return (
    <div className="relative bg-common-background">
      <NavBar />
      {/* <Banner /> */}
      <div className="relative inset-0 z-0 -mt-12 flex h-[calc(100vh-180px)] flex-col items-center justify-center overflow-hidden rounded-t-3xl bg-common-background md:h-[calc(100vh-220px)]">
        <Image
          src={'/images/assets/gradient.webp'}
          fill
          alt=""
          className="z-0 opacity-10 invert dark:invert-0"
          quality={10}
        />
        <div className="z-10 -mt-6 flex h-full w-full flex-col items-center justify-center backdrop-blur-xl">
          <div className="flex h-full w-full flex-col items-center justify-center">
            <span className="mb-1 text-3xl font-bold text-text-primary sm:text-4xl md:hidden">
              Welcome to
            </span>
            <TypewriterEffectSmooth words={words} />
            <p className="mb-6 max-w-3xl px-4 text-center text-xs text-text-secondary sm:text-sm">
              Be part of the change. Join our open platform to review, rate, and access research
              freely. Improve research quality and accessibility with community-driven peer review.
            </p>
            <div className="flex flex-row items-center space-x-4">
              <Link href="/articles">
                <Button variant={'gray'} className="w-40 bg-black text-white dark:text-white">
                  <ButtonTitle>Explore Articles</ButtonTitle>
                </Button>
              </Link>
              <Link href="/communities">
                <Button className="w-40">
                  <ButtonTitle>Visit Communities</ButtonTitle>
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative z-20 rounded-t-3xl pb-20">
            <p className="w-full pb-8 text-center text-sm font-bold text-text-secondary md:text-base">
              Our Supporters
            </p>
            <div className="flex w-full flex-col items-center justify-center gap-8 sm:flex-row">
              {/* KCDHA Logo - CSS-based theme switching */}
              <Image
                width={160}
                height={40}
                src="/images/KCDHA-White.png"
                alt="KCDHA"
                className="hidden dark:block"
              />
              <Image
                width={160}
                height={40}
                src="/images/KCDHA-Black.png"
                alt="KCDHA"
                className="block dark:hidden"
              />
              {/* GSoC Logo - CSS-based theme switching */}
              <Image
                width={280}
                height={40}
                src="/images/GSoC-White.png"
                alt="GSoC"
                className="hidden dark:block"
              />
              <Image
                width={280}
                height={40}
                src="/images/GSoC-Black.png"
                alt="GSoC"
                className="block dark:hidden"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-20 -mt-8 rounded-t-3xl bg-common-background p-12 pb-20">
        <p className="w-full pb-8 text-center text-sm font-bold text-text-secondary md:text-base">
          Featured Video
        </p>
        <div className="flex w-full flex-col items-center justify-center">
          <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-lg border-2 border-functional-greenContrast/20">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/kzZ4-7w4vhk"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            ></iframe>
          </div>
        </div>
      </div>
      {/*
        Features section commented out for now — keep markup for future re-enable

      <div className="relative z-30 -mt-8 h-fit w-full rounded-t-3xl bg-[#E3F2E9] pb-20 dark:bg-[#0F1E15]">
        <div className="flex w-full flex-col items-center py-8">
          <span className="text-center text-xl font-bold text-functional-green md:text-2xl">
            Features
          </span>
          <span className="text-base text-text-secondary">Uniqueness of our platform</span>
        </div>
        <FeaturesSection />
      </div>
      */}
      {/*
        FAQ section commented out for now — keep markup for future re-enable

      <div className="relative z-40 -mt-8 flex w-full flex-col items-center rounded-t-3xl bg-common-background py-12">
        <span className="px-8 text-center text-xl font-bold text-text-primary md:text-2xl">
          We Have Answered Almost All Your Questions
        </span>
        <div className="mt-8 flex w-full max-w-[95%] flex-col items-center p-4 md:max-w-[80%]">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem
                className="w-full border-b border-common-contrast px-0 py-1"
                key={i}
                value={faq?.ques}
              >
                <AccordionTrigger className="w-full p-5" defaultIconNeeded={true}>
                  <span className="w-full text-left text-sm text-text-primary md:text-base">
                    {faq?.ques}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-0">
                  <span className="text-xs text-text-secondary md:text-sm">{faq?.ans}</span>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
      */}
      <Footer />
    </div>
  );
};

export default Home;
