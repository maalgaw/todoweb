export interface Category {
  id: number;
  name: string;
  colorHex?: string;
}

export interface TodoStep {
  id: number;
  title: string;
  isCompleted: boolean;
  todoItemId: number;
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
  isRecurring?: boolean;
  recurrenceType?: number;
  recurrenceInterval?: number;
  recurrenceDaysOfWeek?: string | null;
  recurrenceEndDate?: string | null;
  steps?: TodoStep[];
}
