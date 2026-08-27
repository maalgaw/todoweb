export interface Category {
  id: number;
  name: string;
  colorHex?: string;
}

export interface TodoItem {
  id: number;
  title: string;
  isCompleted: boolean;
  dueDate: string | null;
  description?: string | null;
  priority: number;
  categoryId?: number | null;
  category?: Category | null;
  isDeleted: boolean;
  isPinned: boolean;
}
