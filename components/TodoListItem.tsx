import { useState } from "react";
import { TodoItem, Category } from "../types";

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
}

export default function TodoListItem({
  //Destructuring
  todo,
  categories,
  onToggle,
  onDelete,
  onSave,
  isManage = false,
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
    onSave(todo.id, {
      ...todo,
      title: editTitle.trim(),
      dueDate: editDueDate || null,
      description: editDescription,
      priority: editPriority,
      categoryId: editCategoryId === "" ? undefined : editCategoryId,
    });
    setIsEditing(false);
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
    "px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm";

  //Nếu bấm vào nút sửa => hiển thị giao diện này
  if (isEditing) {
    return (
      <li className="flex bg-white p-4 items-center border border-gray-200 rounded-lg shadow-sm">
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
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(Number(e.target.value))}
            className={editInputClass}
          >
            <option value={0}>🟩 Thấp</option>
            <option value={1}>🟨 Vừa</option>
            <option value={2}>🟥 Cao</option>
          </select>
          <select
            value={editCategoryId}
            onChange={(e) =>
              setEditCategoryId(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            className={editInputClass}
          >
            <option value="">Không gắn thẻ</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

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
    <li className="flex bg-white p-4 gap-4 items-center border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
      {/* Chỉ hiện Khi ở trang quản lý công việc */}
      {isManage === true && (
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
              todo.isCompleted ? "text-gray-400 line-through" : "text-gray-800"
            }`}
          >
            Tên: {todo.title}
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
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium border border-gray-200 flex items-center gap-1">
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

      {/* Chỉ hiển thị khi ở trang quản lý công việc */}
      {isManage === true && (
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors border border-blue-200"
            title="Sửa"
          >
            Sửa
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors border border-red-200"
            title="Xóa"
          >
            Xoá
          </button>
        </div>
      )}
    </li>
  );
}
