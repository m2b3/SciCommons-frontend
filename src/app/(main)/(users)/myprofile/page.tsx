'use client';

import React from 'react';

import PersonalLinks from './PersonalLinks';
import ProfessionalStatus from './ProfessionalStatus';
import Profile from './Profile';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <Profile
        profileImage="/auth/login.png"
        username="johndoe"
        firstName="John"
        lastName="Doe"
        email="johndoe@gmail.com"
        bio="John doe is a good boy"
      />
      <PersonalLinks
        homePage="https://johndoe.com"
        linkedIn="https://linkedin.com/in/johndoe"
        github="https://github.com/johndoe"
        googleScholar="https://scholar.google.com/citations?user=johndoe"
      />
      <ProfessionalStatus email="johndoe@gmail.com" startYear="2019" endYear="Present" />
    </div>
  );
};

export default Home;
