import { useState } from "react";
import { TodoItem, Category } from "../types";
import TodoItemEdit from "./TodoItemEdit";

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
  handleCompleteToggle: (todo: TodoItem) => void;
  handleDelete: (id: number) => void;
  handleEdit: (id: number, updatedData: TodoItem) => void;
  isManage?: boolean;
  isTrashView?: boolean;
  handleRestore?: () => void;
}

export default function TodoListItem({
  //Destructuring
  todo,
  categories,
  handleCompleteToggle,
  handleDelete,
  handleEdit,
  isManage = false,
  isTrashView = false,
  handleRestore,
}: Props) {
  //Mặc định giao diện chỉnh sửa được tắt
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  //Hàm phụ hiển thị nhãn ưu tiên
  const renderPriorityBadge = (priority: number) => {
    switch (priority) {
      case 2:
        return (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium border border-red-200">
            Cao
          </span>
        );
      case 1:
        return (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium border border-yellow-200">
            Vừa
          </span>
        );
      case 0:
        return (
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium border border-emerald-200">
            Thấp
          </span>
        );
      default:
        return null;
    }
  };

  //Nếu bấm vào nút sửa => hiển thị giao diện này
  if (isEditing) {
    return (
      <TodoItemEdit
        todo={todo}
        categories={categories}
        handleEdit={(id, data) => {
          handleEdit(id, data);
          setIsEditing(false);
        }}
        handleCancel={() => setIsEditing(false)}
      />
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
          onChange={() => handleCompleteToggle(todo)}
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
          {renderPriorityBadge(todo.priority)}

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
        <div className="flex items-center space-x-2">
          {isConfirmingDelete ? (
            <>
              {/* Nút Hủy Xóa */}
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors border border-gray-300"
                title="Hủy"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              {/* Nút Xác nhận Xóa */}
              <button
                onClick={() => {
                  setIsConfirmingDelete(false);
                  handleDelete(todo.id);
                }}
                className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors border border-red-200"
                title="Xác nhận xóa"
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
            </>
          ) : (
            <>
              {/* Nút Ghim (Chỉ ở trang Quản lý) */}
              {isManage && !isTrashView && (
                <button
                  onClick={() =>
                    handleEdit(todo.id, { ...todo, isPinned: !todo.isPinned })
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
              {isTrashView && handleRestore && (
                <button
                  onClick={handleRestore}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md text-sm font-medium transition-colors border border-emerald-200"
                  title="Khôi phục"
                >
                  🔄
                </button>
              )}

              {/* Nút Xóa (Dùng chung cho cả Soft Delete và Hard Delete) */}
              <button
                onClick={() => setIsConfirmingDelete(true)}
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
            </>
          )}
        </div>
      )}
    </li>
  );
}
