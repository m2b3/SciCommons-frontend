'use client';

/* Added by Claude on 2026-08-10
   What: Feed Preferences page - the four criteria that build a user's feed, plus a
         template upload that fills the form from a file.
   Why: Users need somewhere to declare what their feed should contain, and typing the
        same long lists by hand every time is tedious.
   How: Load the saved row from /api/feeds/preferences, edit it in chip inputs, and PUT
        the full set back on save so the stored row always matches the form. */
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Download, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import {
  getFeedsApiGetFeedPreferencesQueryKey,
  useFeedsApiGetFeedPreferences,
  useFeedsApiUpdateFeedPreferences,
} from '@/api/feeds/feeds';
import PreferenceChipInput from '@/components/feed/PreferenceChipInput';
import { Button } from '@/components/ui/button';
import { useAuthHeaders } from '@/hooks/useAuthHeaders';
import {
  EMPTY_PREFERENCES,
  type FeedPreferenceField,
  type FeedPreferenceValues,
  downloadTemplateCsv,
  parseTemplateText,
} from '@/lib/feedPreferences/template';
import { showErrorToast } from '@/lib/toastHelpers';

interface FieldConfig {
  field: FeedPreferenceField;
  label: string;
  description: string;
  placeholder: string;
}

const FIELDS: FieldConfig[] = [
  {
    field: 'topics',
    label: 'Areas or topics of interest',
    description: 'Broad subjects your feed should follow.',
    placeholder: 'e.g. auditory neuroscience',
  },
  {
    field: 'authors',
    label: 'Authors',
    description: 'Researchers whose work you want to see.',
    placeholder: 'e.g. Jennifer Doudna',
  },
  {
    field: 'keywords',
    label: 'Keywords',
    description: 'Specific terms to match. Boolean expressions are allowed.',
    placeholder: 'e.g. C. Elegans OR Caenorhabditis Elegans',
  },
  {
    field: 'similar_to',
    label: 'Similar to',
    description: 'Papers to find more like, written as source:identifier.',
    placeholder: 'e.g. pubmed:22878719',
  },
];

const FeedPreferencesPage: React.FC = () => {
  const authHeaders = useAuthHeaders();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<FeedPreferenceValues>(EMPTY_PREFERENCES);
  // The last state we know is in the database, so Save can stay disabled until something changes.
  const [savedValues, setSavedValues] = useState<FeedPreferenceValues>(EMPTY_PREFERENCES);

  const { data, isLoading, error } = useFeedsApiGetFeedPreferences({
    request: authHeaders,
    query: { staleTime: 60 * 1000 },
  });

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  useEffect(() => {
    const preferences = data?.data;
    if (!preferences) return;

    const loaded: FeedPreferenceValues = {
      topics: preferences.topics ?? [],
      authors: preferences.authors ?? [],
      keywords: preferences.keywords ?? [],
      similar_to: preferences.similar_to ?? [],
    };

    setValues(loaded);
    setSavedValues(loaded);
  }, [data]);

  const { mutate: savePreferences, isPending } = useFeedsApiUpdateFeedPreferences({
    request: authHeaders,
  });

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(savedValues),
    [values, savedValues]
  );

  const setField = (field: FeedPreferenceField, fieldValues: string[]) => {
    setValues((previous) => ({ ...previous, [field]: fieldValues }));
  };

  const handleSave = () => {
    savePreferences(
      { data: values },
      {
        onSuccess: (response) => {
          const saved: FeedPreferenceValues = {
            topics: response.data.topics ?? [],
            authors: response.data.authors ?? [],
            keywords: response.data.keywords ?? [],
            similar_to: response.data.similar_to ?? [],
          };

          // Show what the backend actually stored (it trims and de-duplicates).
          setValues(saved);
          setSavedValues(saved);
          queryClient.invalidateQueries({ queryKey: getFeedsApiGetFeedPreferencesQueryKey() });
          toast.success('Feed preferences saved');
        },
        onError: (err) => {
          showErrorToast(err);
        },
      }
    );
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset the input so picking the same file twice still fires a change event.
    event.target.value = '';
    if (!file) return;

    try {
      const parsed = parseTemplateText(file.name, await file.text());

      setValues({
        topics: parsed.topics,
        authors: parsed.authors,
        keywords: parsed.keywords,
        similar_to: parsed.similar_to,
      });

      // Filling the form is not saving it - the user reviews first, then hits Save.
      toast.success(`Loaded ${parsed.entryCount} entries from ${file.name}. Review, then save.`);
    } catch (parseError) {
      toast.error(
        parseError instanceof Error ? parseError.message : 'That file could not be read.'
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold">Feed Preferences</h1>
        <p className="mb-6 text-sm text-text-secondary">
          Tell us what your feed should contain. You can fill this in by hand, or upload a filled
          template.
        </p>

        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-common-contrast/40 bg-common-cardBackground p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json,.txt,text/csv,application/json,text/plain"
            className="hidden"
            onChange={handleFileSelected}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isPending}
          >
            <Upload size={16} className="mr-2" />
            Upload filled template
          </Button>
          <Button type="button" variant="transparent" size="sm" onClick={downloadTemplateCsv}>
            <Download size={16} className="mr-2" />
            Download template
          </Button>
          <p className="w-full text-xs text-text-tertiary">
            Uploading fills the form below — nothing is stored until you save.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="space-y-1">
              {FIELDS.map((config) => (
                <PreferenceChipInput
                  key={config.field}
                  id={config.field}
                  label={config.label}
                  description={config.description}
                  placeholder={config.placeholder}
                  values={values[config.field]}
                  onChange={(fieldValues) => setField(config.field, fieldValues)}
                  disabled={isPending}
                />
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Button type="button" onClick={handleSave} disabled={!isDirty || isPending}>
                {isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
                Save preferences
              </Button>
              {isDirty && !isPending && (
                <Button
                  type="button"
                  variant="transparent"
                  size="sm"
                  onClick={() => setValues(savedValues)}
                >
                  Discard changes
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default withAuthRedirect(FeedPreferencesPage, { requireAuth: true });
