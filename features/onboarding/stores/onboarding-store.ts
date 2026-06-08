import { createJSONStorage, persist } from "zustand/middleware";

import {
  CATEGORY_TEMPLATES,
  getDefaultTemplate,
} from "@/features/onboarding/constants";
import type {
  OnboardingFormData,
  WizardStep,
} from "@/features/onboarding/types";
import { create } from "@/lib/stores/create-store";

const initialForm: OnboardingFormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  storeName: "",
  vertical: "FOOD",
  categoryTemplate: getDefaultTemplate("FOOD"),
  phone: "",
  address: "",
  latitude: null,
  longitude: null,
  locationSource: null,
  locationAccuracy: null,
  acceptTerms: false,
};

interface OnboardingState {
  step: WizardStep;
  form: OnboardingFormData;
  isSubmitting: boolean;
  submitError: string | null;
  setStep: (step: WizardStep) => void;
  updateForm: (patch: Partial<OnboardingFormData>) => void;
  setVertical: (vertical: OnboardingFormData["vertical"]) => void;
  setSubmitting: (value: boolean) => void;
  setSubmitError: (message: string | null) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      step: 1,
      form: { ...initialForm },
      isSubmitting: false,
      submitError: null,

      setStep: (step) => set({ step }),

      updateForm: (patch) =>
        set({ form: { ...get().form, ...patch }, submitError: null }),

      setVertical: (vertical) => {
        const { form } = get();
        const templates = CATEGORY_TEMPLATES[vertical];
        const keepTemplate =
          form.categoryTemplate && templates.includes(form.categoryTemplate);

        set({
          form: {
            ...form,
            vertical,
            categoryTemplate: keepTemplate
              ? form.categoryTemplate
              : getDefaultTemplate(vertical),
          },
          submitError: null,
        });
      },

      setSubmitting: (isSubmitting) => set({ isSubmitting }),

      setSubmitError: (submitError) => set({ submitError }),

      reset: () =>
        set({
          step: 1,
          form: { ...initialForm },
          isSubmitting: false,
          submitError: null,
        }),
    }),
    {
      name: "dts-onboarding-wizard",
      partialize: (state) => ({
        step: state.step,
        form: {
          ...state.form,
          password: "",
          confirmPassword: "",
        },
      }),
      storage: createJSONStorage(() => sessionStorage),
      merge: (persisted, current) => {
        const saved = persisted as Partial<OnboardingState> | undefined;
        return {
          ...current,
          ...saved,
          form: {
            ...initialForm,
            ...saved?.form,
          },
        };
      },
    },
  ),
);
