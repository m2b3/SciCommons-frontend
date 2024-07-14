import React from 'react';

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
}) => (
  <div className="mb-4 flex items-start space-x-3 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
    <div className={`flex-shrink-0 rounded-full p-2 ${iconColor}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex-grow">
      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</h4>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        {role && memberCount ? `${role} · ${memberCount} members` : subtitle}
      </p>
      {type && (
        <span
          className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-semibold 
          ${
            type === 'Article'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
              : type === 'Community'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
          }`}
        >
          {type}
        </span>
      )}
      {communityName && (
        <span className="ml-2 mt-1 inline-block rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-800 dark:bg-purple-900 dark:text-purple-300">
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
