import React from 'react';

import Image from 'next/image';

import { GithubIcon, LinkedinIcon, LucideIcon, TwitterIcon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SocialLink = ({ href, icon: Icon }: { href?: string; icon: LucideIcon }) =>
  href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 transition-colors hover:text-gray-600"
    >
      <Icon size={20} />
    </a>
  ) : null;

const TeamMember = ({
  name,
  role,
  image,
  github,
  linkedin,
  twitter,
}: {
  name: string;
  role: string;
  image: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
}) => (
  <div className="flex flex-col items-center rounded-lg bg-white p-4 shadow-md transition-transform hover:scale-105">
    <Image
      src={image}
      alt={name}
      className="mb-4 h-32 w-32 rounded-full object-cover"
      width={150}
      height={150}
    />
    <h3 className="mb-1 text-xl font-semibold">{name}</h3>
    <p className="mb-3 text-gray-600">{role}</p>
    <div className="flex space-x-3">
      <SocialLink href={github} icon={GithubIcon} />
      <SocialLink href={linkedin} icon={LinkedinIcon} />
      <SocialLink href={twitter} icon={TwitterIcon} />
    </div>
  </div>
);

const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Dinakar Chennupati',
      role: 'Lead Developer',
      image: '/api/placeholder/150/150',
      github: 'https://github.com/dinakar17',
      linkedin: 'https://www.linkedin.com/in/dinakarchennupati/',
      twitter: 'https://x.com/DinakarChennup1',
    },
    {
      name: 'Jyothi Swaroop Reddy',
      role: 'UI/UX Designer',
      image: '/api/placeholder/150/150',
      github: 'https://github.com/janesmith',
      linkedin: 'https://www.linkedin.com/in/janesmith',
    },
    {
      name: 'Armaan',
      role: 'Backend Engineer',
      image: '/api/placeholder/150/150',
      github: 'https://github.com/alexjohnson',
      twitter: 'https://twitter.com/alexjohnson',
    },
    {
      name: 'Maria Garcia',
      role: 'Data Scientist',
      image: '/api/placeholder/150/150',
      linkedin: 'https://www.linkedin.com/in/mariagarcia',
    },
  ];

  return (
    <div className="bg-gray-100">
      <div className="container mx-auto min-h-screen bg-gray-100 px-4 py-8">
        <h1 className="mb-8 text-center text-4xl font-bold text-gray-800">About Our Project</h1>

        <Card className="mb-8 transition-shadow hover:shadow-lg">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle className="text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="mt-4">
            <p className="mb-4">
              We&rsquo;re on a mission to revolutionize the $10 billion research/science publishing
              industry. Our goal? To create an open, accessible, and efficient platform for
              scientific discourse that benefits the entire research community.
            </p>
            <p className="mb-4">
              Traditional publishing models have long diverted substantial funds from crucial
              research activities and erected barriers to accessing vital information. Our project
              harnesses the power of modern internet-based social technology to address these
              pressing issues head-on.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8 transition-shadow hover:shadow-lg">
          <CardHeader className="bg-green-600 text-white">
            <CardTitle className="text-2xl">What We&rsquo;ve Achieved</CardTitle>
          </CardHeader>
          <CardContent className="mt-4">
            <p className="mb-4">
              During last year&rsquo;s Google Summer of Code (GSoC) project, we successfully
              developed an innovative open reviewing and quality-ranking web portal. This
              cutting-edge platform is designed to:
            </p>
            <ul className="mb-4 list-inside list-disc space-y-2">
              <li>Elevate the quality of research discourse</li>
              <li>Streamline scientific communication processes</li>
              <li>Dramatically improve access to groundbreaking research findings</li>
            </ul>
            <p>
              Our solution provides rigorous, objective peer-review alongside a sophisticated
              article rating and filtering mechanism. We&rsquo;ve maintained the high standards of
              traditional journals while embracing an open, cost-effective approach that benefits
              researchers worldwide.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8 transition-shadow hover:shadow-lg">
          <CardHeader className="bg-purple-600 text-white">
            <CardTitle className="text-2xl">Our Team</CardTitle>
            <CardDescription className="text-gray-200">
              The brilliant minds behind this project
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {teamMembers.map((member, index) => (
                <TeamMember key={index} {...member} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
