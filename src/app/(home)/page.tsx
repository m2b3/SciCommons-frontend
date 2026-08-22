'use client';

import Image from 'next/image';
import Link from 'next/link';

import Footer from '@/components/common/Footer';
import NavBar from '@/components/common/NavBar';
import { Button, ButtonTitle } from '@/components/ui/button';

// 👇 1. Import your new Personalized Feed component
import PersonalizedFeed from '@/components/feed/PersonalizedFeed';

const Home = () => {
  return (
    <div className="relative bg-common-background">
      <NavBar />
      <section className="relative overflow-hidden">
        <div className="hero-ambient absolute inset-0" />
        <div className="hero-orb teal float-soft pointer-events-none absolute -left-12 top-24 hidden md:block" />
        <div
          className="hero-orb blue float-soft pointer-events-none absolute -right-20 -top-10 hidden md:block"
          style={{ animationDelay: '2s' }}
        />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-16 pt-20 text-center sm:px-10 sm:pt-24">
          
          <h1
            className="fade-up mt-6 text-4xl font-semibold text-text-primary sm:text-5xl md:text-6xl"
            style={{ animationDelay: '140ms' }}
          >
            Welcome to <span className="text-functional-green">SciCommons</span>
          </h1>
          <p
            className="fade-up mt-4 max-w-2xl text-sm text-text-secondary sm:text-base"
            style={{ animationDelay: '200ms' }}
          >
            Community-driven scholarly discussion.
            <br />
            {/* Updated the text since it is no longer "coming soon!" */}
            Explore your personalized research feed below.
          </p>
          <div
            className="fade-up mt-8 flex flex-wrap items-center justify-center gap-4"
            style={{ animationDelay: '260ms' }}
          >
            <Link href="/communities">
              <Button
                variant={'default'}
                className="w-44 rounded-full bg-gradient-to-r from-functional-green to-functional-blue shadow-lg shadow-functional-green/20 hover:shadow-functional-green/30"
              >
                <ButtonTitle className="text-xs font-semibold tracking-wide">
                  Visit Communities
                </ButtonTitle>
              </Button>
            </Link>
          </div>
          
          <div
            className="fade-up mt-12 flex w-full flex-col items-center justify-center gap-6"
            style={{ animationDelay: '380ms' }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
              Our Supporters
            </p>
            <div className="grid w-full max-w-3xl grid-cols-1 items-center justify-items-center gap-8 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-6">
              <Link
                href="https://www.ashoka.edu.in/page/koita-centre-for-digital-health-at-ashoka/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Koita Centre for Digital Health at Ashoka"
                className="inline-flex items-center justify-center"
              >
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
              </Link>
              <Link
                href="https://www.alliancecan.ca/en"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Digital Research Alliance of Canada"
                className="inline-flex items-center justify-center"
              >
                <Image
                  width={316}
                  height={40}
                  src="/images/DRAC_dark.png"
                  alt="DRAC"
                  className="hidden dark:block"
                />
                <Image
                  width={316}
                  height={40}
                  src="/images/DRAC.png"
                  alt="DRAC"
                  className="block dark:hidden"
                />
              </Link>
              <Link
                href="https://summerofcode.withgoogle.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Google Summer of Code"
                className="inline-flex items-center justify-center"
              >
                <Image
                  width={280}
                  height={40}
                  src="/images/GSoC-White.png"
                  alt="GSoC"
                  className="hidden dark:block sm:-translate-y-px"
                />
                <Image
                  width={280}
                  height={40}
                  src="/images/GSoC-Black.png"
                  alt="GSoC"
                  className="block dark:hidden sm:-translate-y-px"
                />
              </Link>
              <Link
                href="https://www.incf.org/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit International Neuroinformatics Coordinating Facility"
                className="inline-flex items-center justify-center"
              >
                <Image width={74} height={40} src="/images/INCF.png" alt="INCF" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 👇 2. Render the Personalized Feed right below the Hero section */}
      <section className="relative z-10 bg-common-background py-10">
        <PersonalizedFeed />
      </section>

      <Footer />
    </div>
  );
};

export default Home;