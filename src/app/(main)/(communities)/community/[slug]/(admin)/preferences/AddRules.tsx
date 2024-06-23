import React, { useEffect } from 'react';

import { AxiosResponse } from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useCommunitiesApiUpdateCommunity } from '@/api/communities/communities';
import { CommunityDetails } from '@/api/schemas';
import { useAuthStore } from '@/stores/authStore';

interface AddRulesProps {
  data: AxiosResponse<CommunityDetails> | undefined;
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

  const {
    mutate,
    isSuccess,
    isPending: isUpdatePending,
    error,
  } = useCommunitiesApiUpdateCommunity({
    axios: { headers: { Authorization: `Bearer ${accessToken}` } },
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
      };
      // console.log(dataToSend);
      mutate({ communityId: data.data.id, data: dataToSend });
    }
  };

  useEffect(() => {
    if (data) {
      const rules = data.data.rules.map((rule) => ({ rule }));
      reset({
        rules: rules,
      });
    }
  }, [data, reset]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Community details updated successfully!');
    }
  }, [isSuccess]);

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error.response?.data.message}`);
    }
  }, [error]);

  return (
    <div className="my-4 rounded bg-white px-8 py-4 shadow">
      {isPending && <div>Loading...</div>}
      <form onSubmit={handleSubmit((data) => onSubmit(data.rules))} className="space-y-8">
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 self-start">
              <label
                htmlFor={`rules.${index}.rule`}
                className="text-md block font-medium text-gray-700"
              >
                Rule {index + 1}
              </label>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <Controller
              control={control}
              name={`rules.${index}.rule`}
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Add Rule"
                  id={`rules.${index}.rule`}
                  className="mt-1 block w-full rounded-md border-gray-300 px-4 py-2 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              )}
            />
          </div>
        ))}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => append({ rule: '' })}
            className="flex items-center text-green-600 hover:text-green-900"
          >
            <Plus className="mr-1 h-5 w-5" /> Add Rule
          </button>
          <button
            type="submit"
            className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            {isUpdatePending ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRules;
