import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto min-h-screen bg-gray-100 px-4 py-8">
      <h1 className="mb-8 text-center text-4xl font-bold text-gray-800">Privacy Policy</h1>

      <Card className="mb-8 transition-shadow hover:shadow-lg">
        <CardHeader className="bg-green-600 text-white">
          <CardTitle className="text-2xl">1. Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          <p className="mb-4">
            We collect information you provide directly to us, such as when you create an account,
            submit content, or communicate with us. This may include your name, email address, and
            any other information you choose to provide.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8 transition-shadow hover:shadow-lg">
        <CardHeader className="bg-green-600 text-white">
          <CardTitle className="text-2xl">2. How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          <p className="mb-4">
            We use the information we collect to operate, maintain, and improve our services, to
            communicate with you, and to protect our users and enforce our policies.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8 transition-shadow hover:shadow-lg">
        <CardHeader className="bg-green-600 text-white">
          <CardTitle className="text-2xl">3. Information Sharing and Disclosure</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          <p className="mb-4">
            We do not share personal information with companies, organizations, or individuals
            outside of our organization except in the following cases: with your consent, for legal
            reasons, or to protect rights, property, or safety.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8 transition-shadow hover:shadow-lg">
        <CardHeader className="bg-green-600 text-white">
          <CardTitle className="text-2xl">4. Data Security</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          <p className="mb-4">
            We use reasonable measures to help protect information about you from loss, theft,
            misuse and unauthorized access, disclosure, alteration and destruction.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8 transition-shadow hover:shadow-lg">
        <CardHeader className="bg-green-600 text-white">
          <CardTitle className="text-2xl">5. Your Rights</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          <p className="mb-4">
            You have the right to access, update, or delete your personal information. You can do
            this by logging into your account or by contacting us directly.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8 transition-shadow hover:shadow-lg">
        <CardHeader className="bg-green-600 text-white">
          <CardTitle className="text-2xl">6. Changes to This Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          <p className="mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by
            posting the new Privacy Policy on this page and updating the &ldquo;last updated&rdquo;
            date at the top of this Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
