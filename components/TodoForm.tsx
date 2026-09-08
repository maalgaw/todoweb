import { useState, useRef, useEffect } from "react";
import { Category } from "../types";
import toast from "react-hot-toast";
import {
  PlusIcon,
  CalendarIcon,
  HashtagIcon,
  FlagIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import RecurrenceSelector, { RecurrenceConfig } from "./RecurrenceSelector";

interface Props {
  categories: Category[];
  onAdd: (
    title: string,
    dueDate: string,
    description: string,
    priority: number,
    categoryId: number | "",
    recurrenceConfig: RecurrenceConfig
  ) => void;
}

export default function TodoForm({ categories, onAdd }: Props) {
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newPriority, setNewPriority] = useState(0);
  const [newCategoryId, setNewCategoryId] = useState<number | "">("");

  const [recurrence, setRecurrence] = useState<RecurrenceConfig>({
    isRecurring: false,
    recurrenceType: 0,
    recurrenceInterval: 1,
    recurrenceDaysOfWeek: null,
  });

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isRecurrenceOpen, setIsRecurrenceOpen] = useState(false);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

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

  function isOverDue(dueDate?: string | null) {
    if (!dueDate) return false;
    return (
      new Date(dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
    );
  }

  function handleAdd() {
    if (!newTitle.trim()) {
      toast.error("Tên công việc không được để trống!");
      return;
    }
    if (newDueDate && isOverDue(newDueDate)) {
      toast.error("Hạn chót không được thiết lập trong quá khứ!");
      return;
    }

    onAdd(newTitle.trim(), newDueDate, "", newPriority, newCategoryId, recurrence);
    setNewTitle("");
    setNewDueDate("");
    setNewPriority(0);
    setNewCategoryId("");
    setRecurrence({ isRecurring: false, recurrenceType: 0, recurrenceInterval: 1, recurrenceDaysOfWeek: null });
    setIsCategoryOpen(false);
    setIsPriorityOpen(false);
    setIsRecurrenceOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <div
      ref={formRef}
      className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all relative"
    >
      <button
        onClick={handleAdd}
        className="text-emerald-500 hover:text-emerald-600 transition-colors shrink-0"
        title="Thêm công việc"
      >
        <PlusIcon className="w-5 h-5" />
      </button>

      <input
        type="text"
        placeholder="Thêm công việc..."
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-800 placeholder-gray-500"
      />

      <div className="flex items-center gap-1 shrink-0 relative">
        {/* Category Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsCategoryOpen(!isCategoryOpen);
              setIsPriorityOpen(false);
            }}
            className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${newCategoryId ? "text-emerald-600 bg-emerald-50" : "text-gray-500"}`}
            title="Thẻ phân loại"
          >
            <HashtagIcon className="w-5 h-5" />
          </button>

          {isCategoryOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 overflow-hidden">
              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                <button
                  onClick={() => {
                    setNewCategoryId("");
                    setIsCategoryOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${newCategoryId === "" ? "bg-emerald-50 text-emerald-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  Không có thẻ
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setNewCategoryId(c.id);
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${newCategoryId === c.id ? "bg-emerald-50 text-emerald-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Priority Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsPriorityOpen(!isPriorityOpen);
              setIsCategoryOpen(false);
            }}
            className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${newPriority == 1 ? "text-amber-500 bg-amber-50" : newPriority == 2 ? "text-red-400 bg-red-50" : "text-gray-500"}`}
            title="Độ ưu tiên"
          >
            <FlagIcon className="w-5 h-5" />
          </button>

          {isPriorityOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
              {[
                { value: 0, label: "Bình thường" },
                { value: 1, label: "Quan trọng" },
                { value: 2, label: "Gấp" },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => {
                    setNewPriority(p.value);
                    setIsPriorityOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${newPriority === p.value ? "bg-amber-50 text-amber-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
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
            className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${newDueDate ? "text-emerald-600 bg-emerald-50" : "text-gray-500"}`}
            title="Ngày đến hạn"
          >
            <CalendarIcon className="w-5 h-5" />
          </button>
          <input
            type="datetime-local"
            ref={dateInputRef}
            value={newDueDate}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="absolute right-0 top-full opacity-0 pointer-events-none w-0 h-0"
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
            className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${recurrence.isRecurring ? "text-emerald-600 bg-emerald-50" : "text-gray-500"}`}
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
  );
}
