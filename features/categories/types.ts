export type CategoryFieldMode = "multi" | "single";

export interface CategoryFieldOptionRule {
  mode: CategoryFieldMode;
  options: string[];
}

/** Regla en API: lista legacy = multi, objeto con mode, o texto_libre */
export type CategoryFieldRule = string[] | CategoryFieldOptionRule | "texto_libre";

export type CategoryFieldConfig = Record<string, CategoryFieldRule>;

export interface CategoryFieldConfigRow {
  key: string;
  type: "multi_select" | "single_select" | "free_text";
  options: string;
}

export interface CategoryImage {
  id: number;
  url: string;
  is_primary: boolean;
}

export interface Subcategory {
  id: number;
  name: string;
  parent_id: number;
  field_config?: CategoryFieldConfig;
  images?: CategoryImage[];
  primary_image_url?: string | null;
}

export interface CategoryTreeNode {
  id: number;
  name: string;
  field_config?: CategoryFieldConfig;
  subcategories: Subcategory[];
  images?: CategoryImage[];
  primary_image_url?: string | null;
}

export interface CategoryRecord {
  id: number;
  name: string;
  store_id: number;
  parent_id: number | null;
  field_config?: CategoryFieldConfig;
}

export interface CreateCategoryInput {
  name: string;
}

export interface CreateSubcategoryInput {
  name: string;
  parent_id: number;
}

export interface UpdateCategoryInput {
  name: string;
}

export interface CategoryTemplateItem {
  name: string;
  subcategories: string[];
  already_imported: boolean;
}

export interface CategoryTemplateListResponse {
  vertical: string;
  templates: CategoryTemplateItem[];
}
