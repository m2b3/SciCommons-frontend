import React from 'react';

import { Facebook, Linkedin, Mail, Share2, Twitter } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ url, title, description }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'noopener,noreferrer');
    toast.success(`Shared on ${platform}`);
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success('Link copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy link');
      });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Share2 className="h-4 w-4" />
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="flex flex-col space-y-2">
          <Button variant="transparent" onClick={() => handleShare('facebook')}>
            <Facebook className="mr-2 h-4 w-4" />
            Facebook
          </Button>
          <Button variant="transparent" onClick={() => handleShare('twitter')}>
            <Twitter className="mr-2 h-4 w-4" />
            Twitter
          </Button>
          <Button variant="transparent" onClick={() => handleShare('linkedin')}>
            <Linkedin className="mr-2 h-4 w-4" />
            LinkedIn
          </Button>
          <Button variant="transparent" onClick={() => handleShare('email')}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button variant="transparent" onClick={copyToClipboard}>
            Copy Link
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SocialShare;
