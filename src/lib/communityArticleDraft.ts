import { SubmitArticleFormValues } from '@/types';

const STORAGE_KEY = 'communityArticleFormData';

type DraftTab = 'upload' | 'search';

type SavedFormData = Omit<SubmitArticleFormValues, 'pdfFiles'>;

interface CommunityArticleDraft {
    activeTab: DraftTab;
    upload?: SavedFormData;
    search?: SavedFormData;
}

const isValidTab = (value: unknown): value is DraftTab => value === 'upload' || value === 'search';

const removePdfFiles = (formData: SubmitArticleFormValues): SavedFormData => {
    const { pdfFiles: _ignoredPdfFiles, ...savedFormData } = formData;
    return savedFormData;
};

const getDraftKey = (slug: string) => `${STORAGE_KEY}:${slug}`;

export const getCommunityArticleDraft = (
    storage: Storage,
    slug: string
): CommunityArticleDraft | null => {
    if (!slug) {
        return null;
    }

    const savedData = storage.getItem(getDraftKey(slug));
    if (!savedData) {
        return null;
    }

    try {
        const parsedData = JSON.parse(savedData) as Partial<CommunityArticleDraft> | null;
        if (!parsedData || !isValidTab(parsedData.activeTab)) {
            return null;
        }

        return parsedData as CommunityArticleDraft;
    } catch {
        return null;
    }
};

export const saveCommunityArticleDraft = (
    storage: Storage,
    slug: string,
    activeTab: DraftTab,
    formData: SubmitArticleFormValues
) => {
    if (!slug) {
        return null;
    }

    const savedDraft = getCommunityArticleDraft(storage, slug) ?? { activeTab };
    const dataToSave: CommunityArticleDraft = {
        ...savedDraft,
        [activeTab]: removePdfFiles(formData),
        activeTab,
    };

    storage.setItem(getDraftKey(slug), JSON.stringify(dataToSave));
    return dataToSave;
};

export const clearCommunityArticleDraft = (storage: Storage, slug: string) => {
    if (!slug) {
        return;
    }

    storage.removeItem(getDraftKey(slug));
};

export const getCommunityArticleDraftValues = (
    draftData: CommunityArticleDraft,
    defaultValues: SubmitArticleFormValues
): SubmitArticleFormValues => {
    const currentTabData = draftData[draftData.activeTab] ?? {};

    return {
        ...defaultValues,
        ...currentTabData,
        pdfFiles: [],
    };
};
