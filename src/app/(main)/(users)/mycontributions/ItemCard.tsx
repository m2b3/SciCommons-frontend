import React from 'react';

import Link from 'next/link';

import { LucideIcon } from 'lucide-react';
import { Crown, Eye, Shield, UserCircle } from 'lucide-react';

export interface ItemCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  iconColor: string;
  type?: string;
  communityName?: string;
  role?: string;
  memberCount?: number;
  slug?: string;
}

const ItemCard: React.FC<ItemCardProps> = ({
  icon: Icon,
  title,
  subtitle,
  iconColor,
  type,
  communityName,
  role,
  memberCount,
  slug,
}) => (
  <div className="mb-4 flex items-start space-x-3 rounded-lg bg-white-primary p-4 shadow">
    <div className={`flex-shrink-0 rounded-full p-2 ${iconColor}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex-grow">
      {/* Type could be post, article, or community. Write a conditional statement to display the type */}
      <Link
        href={
          type === 'Article'
            ? `/article/${slug}`
            : type === 'Community'
              ? `/community/${slug}`
              : `/posts/${slug}`
        }
      >
        <h4 className="text-sm font-semibold text-dark-primary">{title}</h4>
      </Link>
      <p className="text-xs text-gray-600">
        {role && memberCount ? `${role} · ${memberCount} members` : subtitle}
      </p>
      {type && (
        <span
          className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-semibold ${
            type === 'Article'
              ? 'bg-blue-100 text-blue-800'
              : type === 'Community'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {type}
        </span>
      )}
      {communityName && (
        <span className="ml-2 mt-1 inline-block rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-800">
          {communityName}
        </span>
      )}
    </div>
    {role && (
      <div className="flex-shrink-0" title={role}>
        {role === 'Admin' && <Crown className="h-5 w-5 text-yellow-500" />}
        {role === 'Moderator' && <Shield className="h-5 w-5 text-green-500" />}
        {role === 'Reviewer' && <Eye className="h-5 w-5 text-blue-500" />}
        {role === 'Member' && <UserCircle className="h-5 w-5 text-gray-500" />}
      </div>
    )}
  </div>
);

export default ItemCard;
