import React, { useEffect } from 'react';

import { AxiosResponse } from 'axios';
import { PlusIcon, Trash2 } from 'lucide-react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useCommunitiesApiUpdateCommunity } from '@/api/communities/communities';
import { CommunityOut } from '@/api/schemas';
import { BlockSkeleton, Skeleton, TextSkeleton } from '@/components/common/Skeleton';
import { Button, ButtonIcon, ButtonTitle } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

interface AddRulesProps {
  data: AxiosResponse<CommunityOut> | undefined;
  isPending: boolean;
}

interface Rule {
  rule: string;
}

const AddRules: React.FC<AddRulesProps> = ({ data, isPending }) => {
  const { control, handleSubmit, reset } = useForm<{ rules: Rule[] }>({
    defaultValues: {
      rules: [{ rule: '' }],
    },
  });

  const accessToken = useAuthStore((state) => state.accessToken);

  // Todo: Optimize this code to use a single mutation (add rules and update community details in a single mutation)
  const { mutate, isPending: isUpdatePending } = useCommunitiesApiUpdateCommunity({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onSuccess: () => {
        toast.success('Community Details updated successfully');
      },
      onError: (error) => {
        toast.error(`${error.response?.data.message}`);
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rules',
  });

  const onSubmit = (rules: Rule[]) => {
    if (data) {
      const dataToSend = {
        description: data.data.description,
        tags: data.data.tags,
        type: data.data.type,
        rules: rules.map((rule) => rule.rule),
        about: data.data.about,
      };
      mutate({ communityId: data.data.id, data: { payload: { details: dataToSend } } });
    }
  };

  useEffect(() => {
    if (data) {
      const rules = data.data.rules?.map((rule) => ({ rule }));
      reset({
        rules: rules,
      });
    }
  }, [data, reset]);

  return (
    <div className="my-4 rounded-xl border border-common-contrast bg-common-cardBackground p-4 res-text-sm">
      {isPending && RuleLoading()}
      {data && (
        <form onSubmit={handleSubmit((data) => onSubmit(data.rules))} className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-2 self-start">
                <label
                  htmlFor={`rules.${index}.rule`}
                  className="block font-medium text-text-secondary res-text-xs"
                >
                  Rule {index + 1}
                </label>
              </div>
              <Controller
                control={control}
                name={`rules.${index}.rule`}
                render={({ field }) => (
                  <div className="mt-2 flex w-full items-center justify-between gap-2">
                    <input
                      {...field}
                      placeholder="Add Rule"
                      id={`rules.${index}.rule`}
                      className="block w-full rounded-md px-3 py-2 text-text-primary shadow-sm ring-1 ring-common-contrast res-text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-functional-green sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="flex aspect-square h-full items-center justify-center rounded-md bg-functional-redContrast/10 p-2.5 hover:bg-functional-redContrast/15"
                    >
                      <Trash2 className="size-4 text-functional-red" />
                    </button>
                  </div>
                )}
              />
            </div>
          ))}
          <div className="flex items-center justify-end gap-4">
            <Button variant={'blue'} type="button" onClick={() => append({ rule: '' })}>
              <ButtonIcon>
                <PlusIcon className="size-4" />
              </ButtonIcon>
              <ButtonTitle>Add Rule</ButtonTitle>
            </Button>
            <Button
              variant={'default'}
              type="submit"
              loading={isUpdatePending}
              showLoadingSpinner={false}
            >
              <ButtonTitle> {isUpdatePending ? 'Updating...' : 'Update'}</ButtonTitle>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

const RuleLoading = () => {
  return (
    <Skeleton>
      <TextSkeleton className="w-44" />
      <BlockSkeleton className="h-8" />
    </Skeleton>
  );
};

export default AddRules;
