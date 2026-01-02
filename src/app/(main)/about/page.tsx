'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Globe, LinkedinIcon, LucideIcon, Target, TwitterIcon, Users, Zap } from 'lucide-react';

const SocialLink = ({ href, icon: Icon }: { href?: string; icon: LucideIcon }) =>
  href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="transition-colors hover:text-functional-green"
    >
      <Icon size={20} />
    </a>
  ) : null;

const ContributorCard = ({
  name,
  role,
  image,
  linkedin,
  twitter,
}: {
  name: string;
  role: string;
  image: string;
  linkedin?: string;
  twitter?: string;
}) => (
  <div className="group flex w-64 flex-col items-center rounded-lg border border-common-minimal bg-common-cardBackground p-6 transition-all duration-300 hover:border-functional-green hover:shadow-lg hover:shadow-functional-green/20">
    <div className="relative mb-4">
      <Image
        src={image}
        alt={name}
        className="h-24 w-24 rounded-full object-cover ring-2 ring-functional-green/30 transition-all group-hover:ring-functional-green"
        width={100}
        height={100}
      />
    </div>
    <h3 className="break-words text-center font-semibold text-text-primary">{name}</h3>
    <p className="mb-4 text-center text-xs text-text-secondary">{role}</p>
    <div className="flex space-x-3 text-text-secondary">
      <SocialLink href={linkedin} icon={LinkedinIcon} />
      <SocialLink href={twitter} icon={TwitterIcon} />
    </div>
  </div>
);

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) => (
  <div className="rounded-lg border border-common-minimal bg-common-cardBackground p-6 transition-all duration-300 hover:border-functional-green hover:shadow-lg hover:shadow-functional-green/20">
    <Icon className="mb-4 h-8 w-8 text-functional-green" />
    <h3 className="mb-2 font-semibold text-text-primary">{title}</h3>
    <p className="text-sm text-text-secondary">{description}</p>
  </div>
);

const AboutPage = () => {
  const contributors = [
    {
      name: 'Armaan Alam',
      role: 'Full Stack Engineer',
      image: 'https://cdn.scicommons.org/assets/armaan.jpeg',
      linkedin: 'https://www.linkedin.com/in/armaanalam/',
    },
    {
      name: 'Mohd Faisal Ansari',
      role: 'Frontend Engineer',
      image: 'https://cdn.scicommons.org/assets/faisal.jpg',
      linkedin: 'https://www.linkedin.com/in/mohd-faisal-ansari-1b62b9225/',
    },
  ];

  const otherContributors = ['Jyothi Swaroop Bommareddy', 'Dinakar Chennupati', 'Raju Bugude'];

  const features = [
    {
      icon: Globe,
      title: 'Open & Accessible',
      description:
        'Breaking down barriers to scientific knowledge. Free access to peer-reviewed research for everyone, everywhere.',
    },
    {
      icon: Users,
      title: 'Community-Driven',
      description:
        'Powered by researchers. Transparent, collaborative peer review that puts the community in control.',
    },
    {
      icon: Zap,
      title: 'Efficient & Fast',
      description:
        'Streamlined publishing process. Get your research reviewed and published faster than traditional journals.',
    },
    {
      icon: Target,
      title: 'Quality-Focused',
      description:
        'Rigorous peer review standards maintained while embracing transparency and openness in scientific discourse.',
    },
  ];

  return (
    <div className="relative bg-common-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-br from-functional-green/5 via-functional-blue/5 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-text-primary sm:text-5xl md:text-6xl">
              About <span className="text-functional-green">SciCommons</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-text-secondary sm:text-xl">
              Revolutionizing scientific publishing and peer review through community-driven
              collaboration
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border border-functional-green/20 bg-gradient-to-br from-functional-green/10 to-functional-blue/10 p-8 transition-all duration-300 hover:border-functional-green/50 hover:shadow-lg hover:shadow-functional-green/20">
            <div className="mb-4 inline-block rounded-lg bg-functional-green/20 p-3">
              <Target className="h-6 w-6 text-functional-green" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-text-primary">Our Mission</h2>
            <div className="space-y-3 text-sm text-text-secondary">
              <p>
                The long-term goal of SciCommons is to become a portal for open reviewing,
                commenting and community-sourced quality ranking of scholarly articles.
              </p>
              <p>
                Currently, SciCommons functions as a private journal-club where you can set up
                communities, invite colleagues, and discuss articles among yourselves with ratings.
                Discussions are only open to community members. We&rsquo;re using this period to
                test and debug the site, learn about user preferences and patterns, and work towards
                our broader goal of a public portal.
              </p>
              <p>
                We aim to eventually become at least a partial replacement for the current
                scientific publication process. While there have been several previous attempts at
                such portals, our approach differs in key ways. Learn more in this{' '}
                <a
                  href="https://www.frontiersin.org/research-topics/137/beyond-open-access-visions-for-open-evaluation-of-scientific-papers-by-post-publication-peer-review/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-functional-green hover:underline"
                >
                  research topic on open evaluation
                </a>
                .
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-functional-blue/20 bg-gradient-to-br from-functional-blue/10 to-functional-green/10 p-8 transition-all duration-300 hover:border-functional-blue/50 hover:shadow-lg hover:shadow-functional-blue/20">
            <div className="mb-4 inline-block rounded-lg bg-functional-blue/20 p-3">
              <Zap className="h-6 w-6 text-functional-blue" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-text-primary">
              What We&rsquo;ve Built and How
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="mr-3 text-functional-green">✓</span>
                <span className="text-text-secondary">
                  Work on SciCommons has mostly progressed through Google Summer of Code projects
                  (since 2023) via INCF.
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-functional-green">✓</span>
                <span className="text-text-secondary">
                  Rigorous, objective peer-review with sophisticated rating mechanisms
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-functional-green">✓</span>
                <span className="text-text-secondary">
                  Cost-effective platform maintaining journal-quality standards
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-functional-green">✓</span>
                <span className="text-text-secondary">
                  Multi-community review system for comprehensive feedback
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-functional-green">✓</span>
                <span className="text-text-secondary">
                  Since January 2025, the project is also generously supported by the Koita Center
                  for Digital Health at Ashoka University.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-text-primary sm:text-4xl">
            Why Choose SciCommons?
          </h2>
          <p className="mx-auto max-w-2xl text-text-secondary">
            We combine the rigor of traditional publishing with the openness and efficiency of
            modern technology
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-text-primary sm:text-4xl">Meet Our Team</h2>
          <p className="mx-auto max-w-2xl text-text-secondary">
            Talented individuals dedicated to transforming scientific publishing
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {contributors.map((contributor, index) => (
            <ContributorCard key={index} {...contributor} />
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-text-secondary">
          <p className="mb-1">Also contributed by:</p>
          <p>
            {otherContributors.map((name, idx) => (
              <span key={idx} className="mr-1 inline">
                {name}
                {idx < otherContributors.length - 1 ? ',' : ''}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-functional-green/20 bg-gradient-to-r from-functional-green/10 to-functional-blue/10">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold text-text-primary">
              Join Us in Transforming Science
            </h2>
            <p className="mb-8 text-text-secondary">
              Be part of a global community working to make scientific knowledge open, accessible,
              and free for everyone.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/articles"
                className="rounded-lg bg-functional-green px-8 py-3 font-semibold text-white transition-all hover:bg-functional-green/90 hover:shadow-lg hover:shadow-functional-green/30"
              >
                Explore Articles
              </Link>
              <Link
                href="/communities"
                className="rounded-lg border border-functional-green bg-transparent px-8 py-3 font-semibold text-functional-green transition-all hover:bg-functional-green/10 hover:shadow-lg hover:shadow-functional-green/30"
              >
                Join Communities
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
};

export default AboutPage;
