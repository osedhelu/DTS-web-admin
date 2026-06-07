export type StoreVertical = "FOOD" | "SERVICES" | "RETAIL";

export type WizardStep = 1 | 2 | 3;

export interface AccountStepData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface BusinessStepData {
  storeName: string;
  vertical: StoreVertical;
  categoryTemplate: string;
  phone: string;
  address: string;
}

export interface OnboardingFormData extends AccountStepData, BusinessStepData {
  acceptTerms: boolean;
}

export interface MerchantRegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  store_name: string;
  vertical: StoreVertical;
  category_template: string;
  phone: string;
  address?: string;
}

export interface MerchantRegisterResponse {
  id: number;
  email: string;
  store_id: number;
  detail: string;
}
