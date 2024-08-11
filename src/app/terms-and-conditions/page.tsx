import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsAndConditions = () => {
  return (
    <div className="container mx-auto min-h-screen bg-gray-100 px-4 py-8">
      <h1 className="mb-8 text-center text-4xl font-bold text-gray-800">Terms and Conditions</h1>

      <Card className="mb-8 transition-shadow hover:shadow-lg">
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-2xl">1. Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          <p className="mb-4">
            By accessing and using this open science publishing platform, you accept and agree to be
            bound by the terms and provision of this agreement.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8 transition-shadow hover:shadow-lg">
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-2xl">2. User Responsibilities</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          <p className="mb-4">
            Users are responsible for maintaining the confidentiality of their account and password.
            Users are also responsible for all activities that occur under their account.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8 transition-shadow hover:shadow-lg">
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-2xl">3. Content Submission</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          <p className="mb-4">
            By submitting content to our platform, you grant us a worldwide, non-exclusive,
            royalty-free license to use, reproduce, and distribute your content in connection with
            the service.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8 transition-shadow hover:shadow-lg">
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-2xl">4. Intellectual Property</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          <p className="mb-4">
            The platform and its original content, features, and functionality are owned by us and
            are protected by international copyright, trademark, patent, trade secret, and other
            intellectual property or proprietary rights laws.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8 transition-shadow hover:shadow-lg">
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-2xl">5. Termination</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          <p className="mb-4">
            We may terminate or suspend your account and bar access to the service immediately,
            without prior notice or liability, under our sole discretion, for any reason whatsoever
            and without limitation, including but not limited to a breach of the Terms.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8 transition-shadow hover:shadow-lg">
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-2xl">6. Changes to Terms</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          <p className="mb-4">
            We reserve the right to modify or replace these Terms at any time. It is your
            responsibility to check these Terms periodically for changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsAndConditions;
