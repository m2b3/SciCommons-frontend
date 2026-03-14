import React from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import CommentInput from '@/components/common/CommentInput';
import { TooltipProvider } from '@/components/ui/tooltip';

const buildWordSequence = (count: number): string =>
  Array.from({ length: count }, (_, index) => `word${index + 1}`).join(' ');

const renderCommentInput = (handleSubmit: jest.Mock) =>
  render(
    <TooltipProvider>
      <CommentInput
        onSubmit={handleSubmit}
        placeholder="Write a comment"
        buttonText="Post Comment"
      />
    </TooltipProvider>
  );

describe('CommentInput', () => {
  it('allows submitting comments with up to 1000 words', async () => {
    const handleSubmit = jest.fn();
    const content = buildWordSequence(1000);

    renderCommentInput(handleSubmit);

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: content },
    });
    fireEvent.click(screen.getByRole('button', { name: /post comment/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(content, undefined);
    });
    expect(screen.queryByText('Content must not exceed 1000 words')).not.toBeInTheDocument();
  });

  it('blocks submitting comments above 1000 words', async () => {
    const handleSubmit = jest.fn();

    renderCommentInput(handleSubmit);

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: buildWordSequence(1001) },
    });
    fireEvent.click(screen.getByRole('button', { name: /post comment/i }));

    await waitFor(() => {
      expect(screen.getByText('Content must not exceed 1000 words')).toBeInTheDocument();
    });
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
