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
  <div className="mb-4 flex items-start gap-3 rounded-r-md border-l-4 border-common-contrast bg-common-cardBackground p-3 sm:gap-4 sm:p-4">
    <div className={`flex-shrink-0 rounded-full p-1.5 sm:p-2 ${iconColor}`}>
      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
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
        <h4 className="line-clamp-2 text-wrap text-sm font-semibold text-text-primary hover:underline">
          {title}
        </h4>
      </Link>
      <p className="mt-1 text-xs text-text-tertiary">
        {role && memberCount ? `${role} · ${memberCount} members` : subtitle}
      </p>
      {type && (
        <span
          className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-semibold ${
            type === 'Article'
              ? 'bg-functional-green/10 text-functional-green'
              : type === 'Community'
                ? 'bg-functional-blue/10 text-functional-blue'
                : 'bg-functional-yellow/10 text-functional-yellow'
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
        {role === 'Admin' && <Crown className="h-3 w-3 text-functional-yellow" />}
        {role === 'Moderator' && <Shield className="h-3 w-3 text-functional-green" />}
        {role === 'Reviewer' && <Eye className="h-3 w-3 text-functional-blue" />}
        {role === 'Member' && <UserCircle className="h-3 w-3 text-text-secondary" />}
      </div>
    )}
  </div>
);

export default ItemCard;
