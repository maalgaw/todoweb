import { useState } from "react";
import { TodoItem, Category } from "../types";
import toast from "react-hot-toast";

//Kiểm tra đến hạn trong cùng ngày hôm nay
function isDueToday(dueDate?: string | null) {
  if (!dueDate) return false;
  return (
    new Date(dueDate).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
  );
}

//Kiểm tra công việc quá hạn
function isOverDue(dueDate?: string | null) {
  if (!dueDate) return false;
  return (
    new Date(dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
  );
}

//Định nghĩa dữ liệu nhận nào từ component cha
interface Props {
  todo: TodoItem;
  categories: Category[];
  onToggle: (todo: TodoItem) => void;
  onDelete: (id: number) => void;
  onSave: (id: number, updatedData: TodoItem) => void;
  isManage?: boolean;
  isTrashView?: boolean;
  onRestore?: () => void;
}

export default function TodoListItem({
  //Destructuring
  todo,
  categories,
  onToggle,
  onDelete,
  onSave,
  isManage = false,
  isTrashView = false,
  onRestore,
}: Props) {
  //Mặc định giao diện chỉnh sửa được tắt
  const [isEditing, setIsEditing] = useState(false);
  //Truyền vào ô sửa dữ liệu của công việc
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

  //Xử lý lưu công việc sau khi sửa
  const handleSave = () => {
    if (!confirm("Bạn có chắc chắn muốn lưu những sửa đổi này không?")) return;
    onSave(todo.id, {
      ...todo,
      title: editTitle.trim(),
      dueDate: editDueDate || null,
      description: editDescription,
      priority: editPriority,
      categoryId: editCategoryId === "" ? undefined : editCategoryId,
    });
    setIsEditing(false);
    toast.success("Chỉnh sửa công việc thành công!");
  };

  //Xử lý bấm huỷ khi đang sửa
  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(todo.title);
    setEditDueDate(todo.dueDate?.split("T")[0] || "");
    setEditDescription(todo.description || "");
    setEditPriority(todo.priority);
    setEditCategoryId(todo.categoryId || "");
  };

  //Css các ô điền khi sửa
  const editInputClass =
    "w-full px-3 py-2 border border-gray-500 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm";

  //Nếu bấm vào nút sửa => hiển thị giao diện này
  if (isEditing) {
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

  //Nếu không bấm vào sửa
  return (
    <li
      className={`flex p-4 gap-4 items-center border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${todo.isPinned ? "bg-yellow-50 border-yellow-300" : "bg-white border-gray-400"}`}
    >
      {/* Chỉ hiện khi ở trang quản lý công việc và không ở thùng rác */}
      {isManage === true && !isTrashView && (
        <input
          type="checkbox"
          checked={todo.isCompleted}
          disabled={!isManage}
          onChange={() => onToggle(todo)}
          className="appearance-none w-6 h-6 border-2 border-gray-400 rounded flex items-center justify-center bg-white cursor-pointer transition-transform hover:scale-110 checked:bg-green-600 checked:border-green-600 after:content-['✔'] after:text-white after:text-sm after:hidden checked:after:block disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        />
      )}

      {/* Hiển thị thông tin công việc */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex gap-2 items-center flex-wrap mb-1">
          {/* Tên việc */}
          <span
            className={`text-lg font-medium truncate ${
              todo.isCompleted
                ? "text-gray-400 line-through transition-all duration-200"
                : "text-gray-800 transition-all duration-200"
            }`}
          >
            <span className="text-xl drop-shadow-sm">
              {todo.isPinned ? "📌" : ""}
            </span>
            {todo.title}
          </span>

          {/* Màu sắc, mức độ ưu tiên */}
          {todo.priority === 2 && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium border border-red-200">
              Cao
            </span>
          )}
          {todo.priority === 1 && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium border border-yellow-200">
              Vừa
            </span>
          )}
          {todo.priority === 0 && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium border border-emerald-200">
              Thấp
            </span>
          )}

          {/* Thẻ côgn việc */}
          {todo.category && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium border border-gray-400 flex items-center gap-1">
              🏷️ {todo.category.name}
            </span>
          )}
        </div>

        {/* Mô tả */}
        {todo.description && (
          <p className="text-sm text-gray-500 truncate mb-1">
            Mô tả: {todo.description}
          </p>
        )}
        {/* Hạn - deadline */}
        {todo.dueDate && (
          <span
            className={`text-xs font-medium ${
              isOverDue(todo.dueDate) && !todo.isCompleted
                ? "text-red-500"
                : isDueToday(todo.dueDate) && !todo.isCompleted
                  ? "text-orange-500"
                  : "text-gray-400"
            }`}
          >
            Hạn: {new Date(todo.dueDate).toLocaleDateString("vi-VN")}{" "}
            {isDueToday(todo.dueDate) && !todo.isCompleted && "(Sắp đến hạn)"}
          </span>
        )}
      </div>

      {/* Các nút thao tác */}
      {(isManage === true || isTrashView === true) && (
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          {/* Nút Ghim (Chỉ ở trang Quản lý) */}
          {isManage && !isTrashView && (
            <button
              onClick={() =>
                onSave(todo.id, { ...todo, isPinned: !todo.isPinned })
              }
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${todo.isPinned ? "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200" : "bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-200"}`}
              title={todo.isPinned ? "Bỏ ghim" : "Ghim"}
            >
              📌
            </button>
          )}

          {/* Nút Sửa (Chỉ ở trang Quản lý) */}
          {isManage && !isTrashView && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors border border-blue-200"
              title="Sửa"
            >
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
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                ></path>
              </svg>
            </button>
          )}

          {/* Nút Khôi phục (Chỉ ở Thùng rác) */}
          {isTrashView && onRestore && (
            <button
              onClick={onRestore}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md text-sm font-medium transition-colors border border-emerald-200"
              title="Khôi phục"
            >
              🔄
            </button>
          )}

          {/* Nút Xóa (Dùng chung cho cả Soft Delete và Hard Delete) */}
          <button
            onClick={() => onDelete(todo.id)}
            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors border border-red-200"
            title={isTrashView ? "Xóa vĩnh viễn" : "Xóa"}
          >
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              ></path>
            </svg>
          </button>
        </div>
      )}
    </li>
  );
}
