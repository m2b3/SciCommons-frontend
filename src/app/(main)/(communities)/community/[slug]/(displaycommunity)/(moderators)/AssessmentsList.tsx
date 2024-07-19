import React from 'react';

import { useForm } from 'react-hook-form';

import {
  useCommunitiesApiArticlesGetAssignedArticles,
  useCommunitiesApiArticlesSubmitAssessment,
} from '@/api/community-articles/community-articles';
import FormInput from '@/components/FormInput';
import DisplayArticle from '@/components/articles/DisplayArticle';
import { Button } from '@/components/ui/Button';

interface ArticleAssessmentSubmissionProps {
  communityId: number;
}

interface AssessmentForm {
  comments: string;
}

const AssessmentsList: React.FC<ArticleAssessmentSubmissionProps> = ({ communityId }) => {
  const { data } = useCommunitiesApiArticlesGetAssignedArticles(communityId);
  const { mutate } = useCommunitiesApiArticlesSubmitAssessment();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssessmentForm>();

  const onSubmit = (articleId: number, approved: boolean) => (formData: AssessmentForm) => {
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
          // Handle success (e.g., show a toast notification)
          reset(); // Reset the form after successful submission
        },
        onError: (error) => {
          // Handle error (e.g., show an error message)
          console.error('Error submitting assessment:', error);
        },
      }
    );
  };

  // Ex: mutate({ communityId, articleId, data: { approved: true, comments: 'Great article' } });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Articles for Assessment</h2>
      <div className="flex flex-col gap-8">
        {data &&
          data.data.map((article) => (
            <div key={article.id} className="space-y-4">
              <DisplayArticle article={article} />
              <form
                onSubmit={handleSubmit(onSubmit(Number(article.id), true))}
                className="space-y-4"
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
                    onClick={() => handleSubmit(onSubmit(Number(article.id), false))()}
                  >
                    Reject
                  </Button>
                  <Button type="submit" variant="default">
                    Approve
                  </Button>
                </div>
              </form>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AssessmentsList;
