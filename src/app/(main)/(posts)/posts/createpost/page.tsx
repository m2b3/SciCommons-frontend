'use client';

import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import clsx from 'clsx';
import { Send } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { usePostsApiCreatePost } from '@/api/posts/posts';
import { HashtagsList } from '@/constants/common.constants';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

interface IFormInput {
  title: string;
  content: string;
  hashtags: string[];
}

interface Hashtag {
  hashtag: string;
}

const STORAGE_KEY = 'createPostFormData';

const CreatePostPage: React.FC = () => {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isInitialized, setIsInitialized] = useState(false);
  const [postBody, setPostBody] = useState('');
  const [currentWord, setCurrentWord] = useState('');
  const [availableHashtags, setAvailableHashtags] = useState<Hashtag[]>([]);
  const hashtagDropdownRef = useRef<HTMLUListElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<IFormInput>({
    defaultValues: {
      title: '',
      content: '',
      hashtags: [],
    },
  });

  const { mutate: createPost, isPending } = usePostsApiCreatePost({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onSuccess: (data) => {
        toast.success('Post created successfully');
        router.push(`/posts/${data.data.id}`);
        reset();
        localStorage.removeItem(STORAGE_KEY);
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });

  // Load saved form data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      reset(parsedData);
      setPostBody(parsedData.content || '');
    }
    setIsInitialized(true);
  }, [reset]);

  // Save form data to local storage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      const subscription = watch((formData) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, isInitialized]);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const hashtags = extractHashtags(postBody);
    createPost({ data: { ...data, hashtags } });
  };

  const extractHashtags = (text: string): string[] => {
    const hashtagPattern = /#[a-zA-Z0-9_]+/g;
    const hashtags = text.match(hashtagPattern);
    return hashtags ? hashtags : [];
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPostBody(text);
    setValue('content', text);

    const words = text.split(' ');
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('#')) {
      setCurrentWord(lastWord);
      setAvailableHashtags(
        HashtagsList.filter((hashtagObj) => hashtagObj.hashtag.startsWith(lastWord))
      );
    } else {
      setCurrentWord('');
      setAvailableHashtags([]);
    }
  };

  const renderTextWithHashtags = (text: string) => {
    const words = text.split(' ');
    return words.map((word, index) => {
      if (word.startsWith('#') && word.length > 1) {
        return (
          <span key={index} className="hashtag mr-2 cursor-default text-blue-500">
            {word}
          </span>
        );
      }
    });
  };

  const highlightHashtag = (hashtag: string) => {
    const match = hashtag.match(new RegExp(`(${currentWord})`, 'i'));
    if (match) {
      const parts = hashtag.split(match[1]);
      return (
        <>
          {parts[0]}
          <b>{match[1]}</b>
          {parts[1]}
        </>
      );
    }
    return hashtag;
  };

  return (
    <div className="grid min-h-screen grid-cols-1 text-dark-primary md:grid-cols-[1fr_260px] lg:grid-cols-[1fr_360px]">
      <div className="h-full w-full px-8">
        <div className="mx-auto mt-10 h-fit w-full max-w-[720px] rounded-common-xl border border-gray-100 bg-gray-50 p-6 shadow-common">
          <h1 className="mb-6 text-3xl font-semibold text-gray-700">Create a New Post</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                id="title"
                {...register('title', { required: 'Title is required' })}
                className="w-full rounded-common-lg bg-white-secondary px-3 py-2 ring-1 ring-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Enter your post title"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>
            <div>
              <label htmlFor="content" className="mb-1 block text-sm font-medium text-gray-700">
                Content
              </label>
              <textarea
                id="content"
                {...register('content', { required: 'Content is required' })}
                rows={5}
                className="w-full rounded-common-lg bg-white-primary px-3 py-2 ring-1 ring-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="What's on your mind?"
                value={postBody}
                onChange={handleInputChange}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>
            <div className="mt-2 flex w-full flex-row flex-wrap">
              <span className="text-sm text-gray-700">Hashtags used: </span>
              <span className="flex w-full flex-wrap">{renderTextWithHashtags(postBody)}</span>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className={clsx(
                  'inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
                  { 'disabled:opacity-50': isPending }
                )}
              >
                <Send size={16} className="mr-2" />
                {isPending ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="hidden h-screen w-full overflow-y-auto border-l border-gray-100 bg-gray-100 px-6 py-10 md:flex md:flex-col">
        {availableHashtags?.length > 0 && (
          <div className="flex w-full flex-col gap-4 border-b border-common-contrast pb-4">
            <h4 className="font-bold text-primary">Available Hashtags</h4>
            <div className="w-full rounded-common-lg">
              <ul
                ref={hashtagDropdownRef}
                className="max-h-60 w-full overflow-y-auto rounded-common-lg border border-common-minimal bg-white-primary"
              >
                {availableHashtags.map((hashtagObj, index) => (
                  <li
                    key={index}
                    className="flex cursor-pointer items-center justify-between border-b border-common-minimal p-2 hover:bg-common-minimal/50"
                    onClick={() => {
                      const newPostBody =
                        postBody + hashtagObj.hashtag.substring(currentWord.length);
                      setPostBody(newPostBody);
                      setValue('content', newPostBody);
                      setAvailableHashtags([]);
                    }}
                  >
                    <span className="text-sm text-text-primary">
                      {highlightHashtag(hashtagObj.hashtag)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <div className="mt-4 flex flex-col gap-4">
          <h4 className="font-bold text-primary">Popular Hashtags</h4>
          <div className="flex flex-wrap gap-2">
            {HashtagsList.map((hashtagObj, index) => (
              <div
                key={index}
                className="flex cursor-pointer flex-wrap items-center gap-1 rounded-full bg-gray-200 px-3 py-2"
                onClick={() => {
                  const newPostBody = `${postBody} ${hashtagObj.hashtag}`;
                  setPostBody(newPostBody);
                  setValue('content', newPostBody);
                }}
              >
                <span className="text-sm text-text-primary">{hashtagObj?.hashtag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuthRedirect(CreatePostPage, { requireAuth: true });
