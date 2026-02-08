import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AboutPage = () => {
  return (
    <div className="bg-gray-100">
      <div className="container mx-auto min-h-screen bg-gray-100 px-4 py-8 res-text-base">
        <h1 className="mb-8 text-center font-bold text-gray-800 res-heading-base">
          About Our Project
        </h1>

        <Card className="mb-8 transition-shadow hover:shadow-lg">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle className="res-heading-base">Our Mission</CardTitle>
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
            <CardTitle className="res-heading-base">What We&rsquo;ve Achieved</CardTitle>
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

        {/* <Card className="mb-8 transition-shadow hover:shadow-lg">
          <CardHeader className="bg-purple-600 text-white">
            <CardTitle className="res-heading-base">Our Team</CardTitle>
            <CardDescription className="text-gray-200 res-text-sm">
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
        </Card> */}
      </div>
    </div>
  );
};

export default AboutPage;
