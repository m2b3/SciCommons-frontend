
'use client';

import { FC } from 'react';

import Link from 'next/link';

import { Check, Search, Users } from 'lucide-react';

import type { UserCommunitySchema } from '@/api/schemas';
import { Button, ButtonTitle } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface CommunityPickerProps {
  communities: UserCommunitySchema[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selected: string | null;
  onSelect: (name: string) => void;
  className?: string;
}

const CommunityRow: FC<{
  community: UserCommunitySchema;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ community, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      'flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all duration-150',
      'hover:border-functional-green/50 hover:bg-functional-green/5',
      isSelected
        ? 'border-functional-green bg-functional-green/10'
        : 'border-common-contrast bg-common-cardBackground'
    )}
  >
    <div className="flex min-w-0 items-center gap-3">
      <div
        className={cn(
          'flex h-10 w-10 flex-none items-center justify-center rounded-full',
          isSelected ? 'bg-functional-green/20' : 'bg-functional-blue/10'
        )}
      >
        <Users
          className={cn('h-5 w-5', isSelected ? 'text-functional-green' : 'text-functional-blue')}
        />
      </div>
      <div className="min-w-0">
        <Link
          href={`/community/${community.name}`}
          target="_blank"
          onClick={(e) => e.stopPropagation()}
          className="block truncate font-medium text-text-primary hover:underline"
        >
          {community.name}
        </Link>
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          <span className="capitalize">{community.role}</span>
          <span>•</span>
          <span>{community.members_count} members</span>
        </div>
      </div>
    </div>
    <div
      className={cn(
        'flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 transition-all',
        isSelected
          ? 'border-functional-green bg-functional-green'
          : 'border-common-contrast bg-transparent'
      )}
    >
      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
    </div>
  </button>
);

const PickerSkeleton: FC = () => (
  <div className="space-y-2">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="flex animate-pulse items-center gap-3 rounded-lg border border-common-contrast bg-common-cardBackground p-3"
      >
        <div className="h-10 w-10 rounded-full bg-common-minimal" />
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-common-minimal" />
          <div className="h-3 w-24 rounded bg-common-minimal" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState: FC<{ searchQuery: string }> = ({ searchQuery }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-common-minimal">
      <Users className="h-7 w-7 text-text-tertiary" />
    </div>
    {searchQuery ? (
      <>
        <h3 className="mb-1 text-sm font-medium text-text-primary">No communities found</h3>
        <p className="text-xs text-text-secondary">Try a different search term.</p>
      </>
    ) : (
      <>
        <h3 className="mb-1 text-sm font-medium text-text-primary">No communities yet</h3>
        <p className="mb-3 text-xs text-text-secondary">
          Join a community before posting an article to one.
        </p>
        <Link href="/communities" target="_blank">
          <Button variant="outline" className="text-sm">
            <ButtonTitle>Browse communities</ButtonTitle>
          </Button>
        </Link>
      </>
    )}
  </div>
);

const CommunityPicker: FC<CommunityPickerProps> = ({
  communities,
  isLoading,
  searchQuery,
  onSearchChange,
  selected,
  onSelect,
  className,
}) => (
  <div className={cn('flex flex-col', className)}>
    <div className="relative mb-3">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
      <Input
        placeholder="Search communities..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>

    <ScrollArea className="h-[38vh]">
      <div className="space-y-2 pr-4">
        {isLoading && <PickerSkeleton />}
        {!isLoading && communities.length === 0 && <EmptyState searchQuery={searchQuery} />}
        {!isLoading &&
          communities.map((community) => (
            <CommunityRow
              key={community.name}
              community={community}
              isSelected={selected === community.name}
              onSelect={() => onSelect(community.name)}
            />
          ))}
      </div>
    </ScrollArea>
  </div>
);

export default CommunityPicker;
