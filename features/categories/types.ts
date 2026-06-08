export type CategoryFieldRule = string[] | "texto_libre";

export type CategoryFieldConfig = Record<string, CategoryFieldRule>;

export interface CategoryFieldConfigRow {
  key: string;
  type: "select" | "free_text";
  options: string;
}

export interface Subcategory {
  id: number;
  name: string;
  parent_id: number;
  field_config?: CategoryFieldConfig;
}

export interface CategoryTreeNode {
  id: number;
  name: string;
  field_config?: CategoryFieldConfig;
  subcategories: Subcategory[];
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
