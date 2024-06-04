// components/TabContent.tsx
import React from 'react';

interface CardProps {
  title: string;
  description: string;
}

const Card: React.FC<CardProps> = ({ title, description }) => {
  return (
    <div className="mb-4 rounded-lg bg-white p-4 shadow-md">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export const Articles: React.FC = () => (
  <div>
    <Card title="Article 1" description="Description of Article 1" />
    <Card title="Article 2" description="Description of Article 2" />
  </div>
);

export const Communities: React.FC = () => (
  <div>
    <Card title="Community 1" description="Description of Community 1" />
    <Card title="Community 2" description="Description of Community 2" />
  </div>
);

export const Posts: React.FC = () => (
  <div>
    <Card title="Post 1" description="Description of Post 1" />
    <Card title="Post 2" description="Description of Post 2" />
  </div>
);
