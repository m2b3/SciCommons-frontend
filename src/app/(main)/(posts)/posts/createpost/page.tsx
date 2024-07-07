'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import clsx from 'clsx';
import { Send } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { usePostsApiCreatePost } from '@/api/posts/posts';
import { useAuthStore } from '@/stores/authStore';

// Todo: Replace Title and Content Input fields with FormInput component

interface IFormInput {
  title: string;
  content: string;
}

const CreatePostPage: React.FC = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IFormInput>();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { mutate: createPost, isPending } = usePostsApiCreatePost({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onSuccess: (data) => {
        toast.success('Post created successfully');
        router.push(`/posts/${data.data.id}`);
        reset();
      },
      onError: (error) => {
        console.error('Error creating post:', error);
        toast.error(error.response?.data.message || 'An error occurred while creating the post.');
      },
    },
  });

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    createPost({ data });
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto mt-10 max-w-2xl rounded-lg bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Create a New Post</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              {...register('title', { required: 'Title is required' })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="What's on your mind?"
            ></textarea>
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
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
  );
};

export default CreatePostPage;
