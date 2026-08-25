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
  description?: string;
  priority: number; 
  categoryId?: number;
  category?: Category; 
}
