export interface Subcategory {
  id: number;
  name: string;
  parent_id: number;
}

export interface CategoryTreeNode {
  id: number;
  name: string;
  subcategories: Subcategory[];
}

export interface CategoryRecord {
  id: number;
  name: string;
  store_id: number;
  parent_id: number | null;
}

export interface CreateCategoryInput {
  name: string;
}

export interface CreateSubcategoryInput {
  name: string;
  parent_id: number;
}
