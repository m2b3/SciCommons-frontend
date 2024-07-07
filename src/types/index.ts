import { Option } from '@/components/ui/multiple-selector';

export interface FileObj {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

export interface SubmitArticleFormValues {
  title: string;
  abstract: string;
  keywords: Option[];
  authors: Option[];
  imageFile: FileObj;
  pdfFile: FileObj;
  submissionType: 'Public' | 'Private';
}

export enum Action {
  PromoteAdmin = 'promote_admin',
  PromoteModerator = 'promote_moderator',
  PromoteReviewer = 'promote_reviewer',
  DemoteAdmin = 'demote_admin',
  DemoteModerator = 'demote_moderator',
  DemoteReviewer = 'demote_reviewer',
  Remove = 'remove',
}

export type Reaction = 'upvote' | 'downvote';
