import { useState } from "react";
import { TodoItem, Category } from "../types";
import toast from "react-hot-toast";

//Định dạng kiểu DL nhận được từ component cha
interface Props {
  todo: TodoItem;
  categories: Category[];
  handleEdit: (id: number, updatedData: TodoItem) => void;
  handleCancel: () => void;
}

export default function TodoItemEdit({
  //Destructuring
  todo,
  categories,
  handleEdit,
  handleCancel,
}: Props) {
  //Hiện DL công việc cần sửa vào ô sửa
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDueDate, setEditDueDate] = useState(
    todo.dueDate?.split("T")[0] || "",
  );
  const [editDescription, setEditDescription] = useState(
    todo.description || "",
  );
  const [editPriority, setEditPriority] = useState(todo.priority);
  const [editCategoryId, setEditCategoryId] = useState<number | "">(
    todo.categoryId || "",
  );

  //Xử lý khi bấm lưu
  function handleSave() {
    if (!confirm("Bạn có chắc chắn muốn lưu những sửa đổi này không?")) return;
    handleEdit(todo.id, {
      ...todo,
      title: editTitle.trim(),
      dueDate: editDueDate || null,
      description: editDescription,
      priority: editPriority,
      categoryId: editCategoryId === "" ? undefined : editCategoryId,
    });
    toast.success("Chỉnh sửa công việc thành công!");
  };

  //Css các ô nhập
  const editInputClass =
    "w-full px-3 py-2 border border-gray-500 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm";

  return (
    <li className="flex bg-white p-4 items-center border border-gray-400 rounded-lg shadow-sm">
      <div className="flex flex-col gap-3 w-full">
        <input
          type="text"
          value={editTitle}
          onChange={(event) => setEditTitle(event.target.value)}
          className={editInputClass}
          placeholder="Tên công việc"
        />
        <input
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={editDueDate}
          onChange={(event) => setEditDueDate(event.target.value)}
          className={editInputClass}
        />
        <input
          type="text"
          placeholder="Mô tả..."
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className={editInputClass}
        />
        <div className="relative">
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(Number(e.target.value))}
            className={`${editInputClass} appearance-none pr-10`}
          >
            <option value={0}>🟩 Thấp</option>
            <option value={1}>🟨 Vừa</option>
            <option value={2}>🟥 Cao</option>
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
        <div className="relative">
          <select
            value={editCategoryId}
            onChange={(e) =>
              setEditCategoryId(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            className={`${editInputClass} appearance-none pr-10`}
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
        <div className="flex gap-2 mt-1">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md text-sm font-medium transition-colors shadow-sm"
          >
            Lưu
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-md text-sm font-medium transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>
    </li>
  );
}
