import { useState } from "react";
import { Category } from "../types";
import toast from "react-hot-toast";
//Định nghĩa kiểu dữ liệu form công việc được gửi từ component con -> cha
interface Props {
  categories: Category[];
  onAdd: (
    title: string,
    dueDate: string,
    description: string,
    priority: number,
    categoryId: number | "",
  ) => void;
}

export default function TodoForm({ categories, onAdd }: Props) {
  //Mặc định ở các ô điền thông tin tạo mới côgn việc là rỗng
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState(1);
  const [newCategoryId, setNewCategoryId] = useState<number | "">("");

  //Hàm so sánh hạn chót
  function isOverDue(dueDate?: string | null) {
    if (!dueDate) return false;
    return (
      new Date(dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
    );
  }

  //Xử lý khi ấn thêm công việc
  const handleAddClick = () => {
    if (newDueDate && isOverDue(newDueDate)) {
      toast.error("Hạn chót không được thiết lập trong quá khứ!");
      return;
    }
    if (!newTitle.trim()) {
      toast.error("Tên công việc không được để trống!");
      return;
    }

    onAdd(
      newTitle.trim(),
      newDueDate,
      newDescription,
      newPriority,
      newCategoryId,
    );

    //Reset form sau khi thêm
    setNewTitle("");
    setNewDueDate("");
    setNewDescription("");
    setNewPriority(1);
    setNewCategoryId("");
  };

  //CSS các ô điền
  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all";

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm mb-8">
      <div className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tên công việc <span className="text-red-500">*</span>
          </label>
          {/* Nhập tên cônng việc */}
          <input
            type="text"
            placeholder="Ví dụ: Làm bài deadline"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleAddClick()}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Hạn chót
            </label>
            {/* Nhập hạn chót */}
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={newDueDate}
              onChange={(event) => setNewDueDate(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            {/* Chọn thẻ phân loại */}
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Thẻ phân loại
            </label>
            <div className="relative">
              <select
                value={newCategoryId}
                onChange={(e) =>
                  setNewCategoryId(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className={`${inputClass} appearance-none pr-10`}
              >
                <option value="">Không gắn thẻ</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* Chọn mức độ ưu tiên */}
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Mức độ ưu tiên
          </label>
          <div className="relative">
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(Number(e.target.value))}
              className={`${inputClass} appearance-none pr-10`}
            >
              <option value={0}>🟩 Ưu tiên thấp</option>
              <option value={1}>🟨 Ưu tiên trung bình</option>
              <option value={2}>🟥 Ưu tiên cao</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Mô tả chi tiết
          </label>
          {/* Ô nhập công việc */}
          <textarea
            placeholder="Nhập ghi chú hoặc mô tả chi tiết..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            rows={3}
            className={`${inputClass}`}
          />
        </div>

        {/* Nút thêm công việc */}
        <button
          onClick={handleAddClick}
          className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          Thêm công việc
        </button>
      </div>
    </div>
  );
}
