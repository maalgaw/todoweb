import { useState, useRef, useEffect } from "react";
import { TodoItem, Category, TodoStep } from "../types";
import toast from "react-hot-toast";
import {
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  HashtagIcon,
  FlagIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import RecurrenceSelector, { RecurrenceConfig } from "./RecurrenceSelector";
import api from "../lib/axiosConfig";

interface Props {
  todo: TodoItem;
  categories: Category[];
  handleEdit: (id: number, updatedData: TodoItem) => void;
  handleCancel: () => void;
}

export default function TodoItemEdit({
  todo,
  categories,
  handleEdit,
  handleCancel,
}: Props) {
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(
    todo.description || "",
  );
  const [editDueDate, setEditDueDate] = useState(
    todo.dueDate ? todo.dueDate.slice(0, 16) : "",
  );
  const [editPriority, setEditPriority] = useState(todo.priority);
  const [editCategoryId, setEditCategoryId] = useState<number | "">(
    todo.categoryId || "",
  );

  const [recurrence, setRecurrence] = useState<RecurrenceConfig>({
    isRecurring: todo.isRecurring || false,
    recurrenceType: todo.recurrenceType || 0,
    recurrenceInterval: todo.recurrenceInterval || 1,
    recurrenceDaysOfWeek: todo.recurrenceDaysOfWeek || null,
  });

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isRecurrenceOpen, setIsRecurrenceOpen] = useState(false);

  const [steps, setSteps] = useState<TodoStep[]>(todo.steps || []);
  const [newStepTitle, setNewStepTitle] = useState("");

  const dateInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
        setIsPriorityOpen(false);
        setIsRecurrenceOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSave() {
    if (!editTitle.trim()) {
      toast.error("Tên công việc không được để trống!");
      return;
    }

    // Check if the due date is strictly in the past, but allow editing existing past tasks if the date didn't change
    if (
      editDueDate &&
      editDueDate.slice(0, 10) !== todo.dueDate?.slice(0, 10)
    ) {
      if (
        new Date(editDueDate).setHours(0, 0, 0, 0) <
        new Date().setHours(0, 0, 0, 0)
      ) {
        toast.error("Hạn chót không được thiết lập trong quá khứ!");
        return;
      }
    }

    handleEdit(todo.id, {
      ...todo,
      title: editTitle.trim(),
      description: editDescription.trim() || null,
      dueDate: editDueDate || null,
      priority: editPriority,
      categoryId: editCategoryId === "" ? undefined : editCategoryId,
      isRecurring: recurrence.isRecurring,
      recurrenceType: recurrence.recurrenceType,
      recurrenceInterval: recurrence.recurrenceInterval,
      recurrenceDaysOfWeek: recurrence.recurrenceDaysOfWeek,
    });
    toast.success("Chỉnh sửa công việc thành công!");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  }

  const handleAddStep = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newStepTitle.trim()) {
      e.preventDefault();
      try {
        const response = await api.post(`/api/todosteps/${todo.id}`, {
          title: newStepTitle.trim(),
        });
        setSteps([...steps, response.data]);
        setNewStepTitle("");
      } catch {
        toast.error("Lỗi khi thêm bước!");
      }
    }
  };

  const handleToggleStep = async (
    stepId: number,
    isCompleted: boolean,
    title: string,
  ) => {
    try {
      const response = await api.put(`/api/todosteps/${stepId}`, {
        title,
        isCompleted: !isCompleted,
      });
      setSteps(steps.map((s) => (s.id === stepId ? response.data : s)));
    } catch {
      toast.error("Lỗi khi cập nhật bước!");
    }
  };

  const handleDeleteStep = async (stepId: number) => {
    try {
      await api.delete(`/api/todosteps/${stepId}`);
      setSteps(steps.filter((s) => s.id !== stepId));
    } catch {
      toast.error("Lỗi khi xóa bước!");
    }
  };

  return (
    <li
      ref={formRef}
      className="flex flex-col gap-2 bg-white rounded-xl px-4 py-3 shadow-sm border border-emerald-500 ring-1 ring-emerald-500 relative my-2 mx-2"
    >
      <div className="flex items-center gap-3 w-full">
        <button
          onClick={handleSave}
          className="text-emerald-500 hover:text-emerald-600 shrink-0 p-1"
          title="Lưu"
        >
          <CheckIcon className="w-5 h-5" />
        </button>

        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-red-500 shrink-0 p-1"
          title="Hủy"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <input
          type="text"
          placeholder="Tên công việc..."
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium text-gray-800 placeholder-gray-500"
        />

        <div className="flex items-center gap-1 shrink-0 relative">
          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsCategoryOpen(!isCategoryOpen);
                setIsPriorityOpen(false);
                setIsRecurrenceOpen(false);
              }}
              className={`p-1.5 rounded-md hover:bg-gray-100 ${editCategoryId ? "text-emerald-600 bg-emerald-50" : "text-gray-500"}`}
              title="Phân loại"
            >
              <HashtagIcon className="w-5 h-5" />
            </button>

            {isCategoryOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={() => {
                    setEditCategoryId("");
                    setIsCategoryOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${editCategoryId === "" ? "bg-emerald-50 text-emerald-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  Không phân loại
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setEditCategoryId(c.id);
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm ${editCategoryId === c.id ? "bg-emerald-50 text-emerald-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Priority Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsPriorityOpen(!isPriorityOpen);
                setIsCategoryOpen(false);
                setIsRecurrenceOpen(false);
              }}
              className={`p-1.5 rounded-md hover:bg-gray-100 ${editPriority > 0 ? "text-amber-500 bg-amber-50" : "text-gray-500"}`}
              title="Mức độ ưu tiên"
            >
              <FlagIcon className="w-5 h-5" />
            </button>

            {isPriorityOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50">
                {[
                  { value: 0, label: "Thấp" },
                  { value: 1, label: "Trung bình" },
                  { value: 2, label: "Cao" },
                ].map((p) => (
                  <button
                    key={p.value}
                    onClick={() => {
                      setEditPriority(p.value);
                      setIsPriorityOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm ${editPriority === p.value ? "bg-amber-50 text-amber-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Calendar Picker */}
          <div className="relative">
            <button
              onClick={() => {
                dateInputRef.current?.showPicker?.();
                setIsCategoryOpen(false);
                setIsPriorityOpen(false);
                setIsRecurrenceOpen(false);
              }}
              className={`p-1.5 rounded-md hover:bg-gray-100 ${editDueDate ? "text-emerald-600 bg-emerald-50" : "text-gray-500"}`}
              title="Ngày đến hạn"
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
            <input
              type="datetime-local"
              ref={dateInputRef}
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="absolute right-0 bottom-full opacity-0 pointer-events-none w-0 h-0"
            />
          </div>

          {/* Recurrence Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsRecurrenceOpen(!isRecurrenceOpen);
                setIsCategoryOpen(false);
                setIsPriorityOpen(false);
              }}
              className={`p-1.5 rounded-md hover:bg-gray-100 ${recurrence.isRecurring ? "text-emerald-600 bg-emerald-50" : "text-gray-500"}`}
              title="Lặp lại"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>

            {isRecurrenceOpen && (
              <RecurrenceSelector
                value={recurrence}
                onChange={setRecurrence}
                onClose={() => setIsRecurrenceOpen(false)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="pl-12 pr-4 pt-1 w-full">
        <textarea
          placeholder="Thêm ghi chú..."
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full bg-transparent border-none focus:outline-none text-xs text-gray-600 placeholder-gray-400 resize-none min-h-10"
          rows={2}
        />
      </div>

      {/* Steps List */}
      <div className="pl-12 pr-4 pt-2 border-t border-gray-100 w-full mt-1">
        <div className="space-y-1 mb-2">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-2 group">
              <input
                type="checkbox"
                checked={step.isCompleted}
                onChange={() =>
                  handleToggleStep(step.id, step.isCompleted, step.title)
                }
                className="w-4 h-4 text-emerald-500 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
              />
              <div className="flex-1 min-w-0 flex flex-col">
                <span
                  className={`text-sm ${step.isCompleted ? "text-gray-400 line-through" : "text-gray-700"}`}
                >
                  {step.title}
                </span>
                {step.isCompleted && step.completedByUser && (
                  <span className="text-[10px] text-emerald-600">
                    Hoàn thành bởi: {step.completedByUser.displayName || step.completedByUser.username}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDeleteStep(step.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
            <span className="text-[10px] text-gray-400">+</span>
          </div>
          <input
            type="text"
            placeholder="Thêm bước..."
            value={newStepTitle}
            onChange={(e) => setNewStepTitle(e.target.value)}
            onKeyDown={handleAddStep}
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-emerald-700 placeholder-emerald-400"
          />
        </div>
      </div>
    </li>
  );
}
