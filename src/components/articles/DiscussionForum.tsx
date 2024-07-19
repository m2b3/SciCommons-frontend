import React, { useEffect, useState } from 'react';

import Image from 'next/image';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ArrowLeft, ChevronDown, ChevronUp, MessageSquare, MoreVertical } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  useArticlesDiscussionApiCreateDiscussion,
  useArticlesDiscussionApiGetDiscussion,
  useArticlesDiscussionApiListDiscussions,
} from '@/api/discussions/discussions';
import FormInput from '@/components/FormInput';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/constants';
import useIdenticon from '@/hooks/useIdenticons';
import { useAuthStore } from '@/stores/authStore';

interface FormValues {
  topic: string;
  content: string;
}

interface DiscussionForumProps {
  articleId: number;
  communityId?: number;
}

const DiscussionForum: React.FC<DiscussionForumProps> = ({ articleId, communityId }) => {
  dayjs.extend(relativeTime);
  const accessToken = useAuthStore((state) => state.accessToken);
  const imageData = useIdenticon(40);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [discussionId, setDiscussionId] = useState<number | null>(null);

  const { data: discussionData, error: discussionError } = useArticlesDiscussionApiGetDiscussion(
    discussionId || 0,
    {
      query: { enabled: discussionId !== null },
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  useEffect(() => {
    if (discussionError) {
      toast.error(`${discussionError.response?.data.message || ErrorMessage}`);
    }
  }, [discussionError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      topic: '',
      content: '',
    },
  });

  const { data, error } = useArticlesDiscussionApiListDiscussions(articleId);

  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message || ErrorMessage}`);
    }
  }, [error]);

  const { mutate } = useArticlesDiscussionApiCreateDiscussion({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onMutate: () => {
        toast.loading('Creating discussion...');
      },
      onSuccess: () => {
        toast.success('Discussion created successfully');
        setShowForm(false);
        reset();
      },
      onError: (error) => {
        toast.error(`${error.response?.data.message || ErrorMessage}`);
      },
    },
  });

  const handleNewDiscussion = (): void => {
    setShowForm(true);
  };

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    mutate({ articleId, data, params: { community_id: communityId } });
  };

  const handleDiscussionClick = (discussionId: number): void => {
    setDiscussionId(discussionId);
  };
  const handleBackToList = (): void => {
    setDiscussionId(null);
  };

  if (discussionData && discussionId) {
    return (
      <div>
        <Button onClick={handleBackToList} className="mb-4">
          <ArrowLeft className="mr-2" /> Back to Discussions
        </Button>
        <div className="mb-4 rounded bg-white p-4 shadow">
          <div className="mb-2 flex items-center">
            <Image
              src={discussionData.data.user.profile_pic_url || `data:image/png;base64,${imageData}`}
              alt={discussionData.data.anonymous_name || discussionData.data.user.username}
              width={32}
              height={32}
              className="mr-2"
            />
            <span className="font-bold">{discussionData.data.anonymous_name}</span>
            <span className="ml-2 text-gray-500">
              {dayjs(discussionData.data.created_at).fromNow()}
            </span>
          </div>
          <h2 className="mb-2 text-xl font-bold">{discussionData.data.topic}</h2>
          <p className="mb-4">{discussionData.data.content}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ChevronUp className="cursor-pointer" />
              <span className="mx-2 font-bold">{0}</span>
              <ChevronDown className="cursor-pointer" />
            </div>
            <div className="flex items-center">
              <MessageSquare className="mr-2" />
              <span>{discussionData.data.comments_count} comments</span>
            </div>
          </div>
        </div>
        <h3 className="mb-2 text-lg font-bold">Comments</h3>
        {/* {selectedDiscussion.comments.map((comment) => (
          <div key={comment.id} className="mb-2 rounded bg-white p-4 shadow">
            <div className="mb-2 flex items-center">
              <Image
                src={comment.avatar}
                alt={comment.author}
                width={32}
                height={32}
                className="mr-2"
              />
              <span className="font-bold">{comment.author}</span>
              <span className="ml-2 text-gray-500">{comment.time}</span>
            </div>
            <p>{comment.content}</p>
          </div>
        ))} */}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Discussions</h1>
        <Button
          onClick={handleNewDiscussion}
          className="bg-green-500 text-white hover:bg-green-600"
        >
          + New Discussion
        </Button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-4 rounded bg-white p-4 shadow">
          <FormInput<FormValues>
            label="Topic"
            name="topic"
            type="text"
            placeholder="Enter discussion topic"
            register={register}
            requiredMessage="Topic is required"
            errors={errors}
          />
          <FormInput<FormValues>
            label="Content"
            name="content"
            type="text"
            placeholder="Enter discussion content"
            register={register}
            requiredMessage="Content is required"
            errors={errors}
            textArea={true}
          />
          <Button type="submit" className="mt-4 bg-blue-500 text-white hover:bg-blue-600">
            Submit
          </Button>
        </form>
      ) : (
        <>
          {data?.data.items.length === 0 && (
            <EmptyState
              content="No discussions yet"
              subcontent="Be the first to start a discussion"
            />
          )}
          {data?.data.items.map((discussion) => (
            <div
              key={discussion.id}
              className="mb-4 cursor-pointer rounded bg-white p-4 shadow"
              onClick={() => handleDiscussionClick(Number(discussion.id))}
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center">
                  <Image
                    src={discussion.user.profile_pic_url || `data:image/png;base64,${imageData}`}
                    alt={discussion.anonymous_name || discussion.user.username}
                    width={32}
                    height={32}
                    className="mr-2"
                  />
                  <div>
                    <span className="font-bold">{discussion.anonymous_name}</span>
                    <span className="ml-2 text-gray-500">
                      {dayjs(discussion.created_at).fromNow()}
                    </span>
                  </div>
                </div>
                <MoreVertical className="text-gray-500" />
              </div>
              <h2 className="mb-2 text-lg font-bold">{discussion.topic}</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ChevronUp className="cursor-pointer" />
                  <span className="mx-2 font-bold">{0}</span>
                  <ChevronDown className="cursor-pointer" />
                </div>
                <div className="flex items-center">
                  <MessageSquare className="mr-2" />
                  <span>{discussion.comments_count} comments</span>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default DiscussionForum;
