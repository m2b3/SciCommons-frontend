'use client';

import React from 'react';

import { useParams } from 'next/navigation';

import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import {
  useCommunitiesApiArticlesGetAssessmentDetails,
  useCommunitiesApiArticlesSubmitAssessment,
} from '@/api/community-articles/community-articles';
import FormInput from '@/components/FormInput';
import DisplayArticle from '@/components/articles/DisplayArticle';
import { Button } from '@/components/ui/button';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

interface AssessmentForm {
  comments: string;
}

const Page = () => {
  const params = useParams<{ slug: string; assessmentId: string }>();
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data } = useCommunitiesApiArticlesGetAssessmentDetails(
    params?.slug || '',
    Number(params?.assessmentId),
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  const { mutate } = useCommunitiesApiArticlesSubmitAssessment({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssessmentForm>();

  const onSubmit =
    (articleId: number, approved: boolean, communityId: number) => (formData: AssessmentForm) => {
      mutate(
        {
          communityId,
          articleId,
          data: {
            approved,
            comments: formData.comments,
          },
        },
        {
          onSuccess: () => {
            toast.success('Assessment submitted successfully');
            reset();
          },
          onError: (error) => {
            showErrorToast(error);
          },
        }
      );
    };

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h2 className="mb-4 text-xl font-semibold">Article for Assessment</h2>
      {data && (
        <div className="flex flex-col gap-8">
          <DisplayArticle article={data.data.article} />
          <form
            onSubmit={handleSubmit(
              onSubmit(
                Number(data.data.article.id),
                true,
                data.data.article.community_article_status?.community.id as number
              )
            )}
            className="flex flex-col gap-4"
          >
            <FormInput<AssessmentForm>
              label="Comments"
              name="comments"
              type="text"
              placeholder="Enter your comments here..."
              register={register}
              requiredMessage="Comments are required"
              info="Provide your assessment comments for this article."
              errors={errors}
              textArea={true}
            />
            <div className="flex justify-end space-x-4">
              <Button
                type="submit"
                variant="destructive"
                onClick={() => {
                  onSubmit(
                    Number(data.data.article.id),
                    false,
                    data.data.article.community_article_status?.community.id as number
                  )({
                    comments: '',
                  });
                }}
              >
                Reject
              </Button>
              <Button type="submit" variant="default">
                Approve
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Page;
