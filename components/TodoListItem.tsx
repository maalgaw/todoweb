import { useState } from "react";
import { TodoItem, Category } from "../types";
import TodoItemEdit from "./TodoItemEdit";
import { 
 XMarkIcon,
 CheckIcon,
 BookmarkIcon,
 PencilIcon,
 TrashIcon,
 ArrowUturnLeftIcon,
 CalendarIcon,
 ArrowPathIcon
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkIconSolid } from "@heroicons/react/24/solid";

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

 isTrashView = false,
 handleRestore,
}: Props) {
 //Mặc định giao diện chỉnh sửa được tắt
 const [isEditing, setIsEditing] = useState(false);
 const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

 //Hàm phụ hiển thị nhãn ưu tiên (Dạng dấu chấm nhỏ gọn)
 function renderPriorityBadge(priority: number) {
 switch (priority) {
 case 2:
 return (
 <span
 className="flex items-center text-xs text-red-500 gap-1"
 title="Độ ưu tiên: Cao"
 >
 <span className="w-2 h-2 rounded-full bg-red-500"></span>
 </span>
 );
 case 1:
 return (
 <span
 className="flex items-center text-xs text-yellow-500 gap-1"
 title="Độ ưu tiên: Vừa"
 >
 <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
 </span>
 );
 case 0:
 return (
 <span
 className="flex items-center text-xs text-emerald-500 gap-1"
 title="Độ ưu tiên: Thấp"
 >
 <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
 </span>
 );
 default:
 return null;
 }
 }

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
 className={`flex py-3 px-2 gap-3 items-center border-b border-gray-100 hover:bg-gray-50 group ${todo.isPinned ? "bg-yellow-50/30" : "bg-white"}`}
 >
 {/* Chỉ hiện khi không ở thùng rác */}
 {!isTrashView && (
 <input
 type="checkbox"
 checked={todo.isCompleted}
 onChange={() => handleCompleteToggle(todo)}
 className="appearance-none w-6 h-6 border-2 border-gray-300 rounded-full flex shrink-0 items-center justify-center bg-white cursor-pointer hover:border-emerald-500 checked:bg-emerald-500 checked:border-emerald-500 after:content-['✔'] after:text-white after:text-xs after:font-bold after:hidden checked:after:block disabled:opacity-50 disabled:cursor-not-allowed"
 />
 )}

 {/* Hiển thị thông tin công việc */}
 <div className="flex flex-col flex-1 min-w-0">
 <div className="flex gap-2 items-center flex-wrap mb-1">
 {/* Tên việc */}
 <span
 className={`text-base truncate flex items-center ${
 todo.isCompleted
 ? "text-gray-400 line-through "
 : "text-gray-800 font-medium "
 }`}
 >
 {todo.isPinned ? <BookmarkIconSolid className="w-4 h-4 mr-1.5 text-yellow-500 shrink-0" /> : null}
 {todo.title}
 </span>

 {/* Màu sắc, mức độ ưu tiên */}
 {renderPriorityBadge(todo.priority)}

 {/* Thẻ công việc */}
 {todo.category && (
 <span className="text-xs text-gray-500 flex items-center gap-1">
 #{todo.category.name}
 </span>
 )}
 </div>

 {/* Mô tả & Hạn (Hiển thị chung một dòng cho gọn) */}
 <div className="flex items-center gap-3 text-xs mt-0.5">
 {todo.description && (
 <span className="text-gray-500 truncate max-w-50">
 {todo.description}
 </span>
 )}
 {todo.dueDate && (
 <span
 className={`flex items-center gap-1 ${
 isOverDue(todo.dueDate) && !todo.isCompleted
 ? "text-red-500"
 : isDueToday(todo.dueDate) && !todo.isCompleted
 ? "text-orange-500"
 : "text-gray-400"
 }`}
 >
 <CalendarIcon className="w-3.5 h-3.5 shrink-0" /> {new Date(todo.dueDate).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })}
 </span>
 )}
 {todo.isRecurring && (
 <span className="text-emerald-500 flex items-center gap-1" title="Lặp lại">
 <ArrowPathIcon className="w-3.5 h-3.5 shrink-0" />
 </span>
 )}
 </div>
 </div>

 {/* Các nút thao tác */}

 <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 ">
 {isConfirmingDelete ? (
 <>
 {/* Nút Hủy Xóa */}
 <button
 onClick={() => setIsConfirmingDelete(false)}
 className="px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-200 rounded-md text-sm font-medium border border-gray-300"
 title="Hủy"
 >
 <XMarkIcon className="w-4 h-4" />
 </button>
 {/* Nút Xác nhận Xóa */}
 <button
 onClick={() => {
 setIsConfirmingDelete(false);
 handleDelete(todo.id);
 }}
 className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium border border-red-200"
 title="Xác nhận xóa"
 >
 <CheckIcon className="w-4 h-4" />
 </button>
 </>
 ) : (
 <>
 {/* Nút Ghim (Chỉ ở trang Quản lý) */}
 {!isTrashView && (
 <button
 onClick={() =>
 handleEdit(todo.id, { ...todo, isPinned: !todo.isPinned })
 }
 className={`p-1.5 rounded ${todo.isPinned ? "text-yellow-600 bg-yellow-50" : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"}`}
 title={todo.isPinned ? "Bỏ ghim" : "Ghim"}
 >
 {todo.isPinned ? (
 <BookmarkIconSolid className="w-4 h-4" />
 ) : (
 <BookmarkIcon className="w-4 h-4" />
 )}
 </button>
 )}

 {/* Nút Sửa (Chỉ ở trang Quản lý) */}
 {!isTrashView && (
 <button
 onClick={() => setIsEditing(true)}
 className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded "
 title="Sửa"
 >
 <PencilIcon className="w-4 h-4" />
 </button>
 )}

 {/* Nút Khôi phục (Chỉ ở Thùng rác) */}
 {isTrashView && handleRestore && (
 <button
 onClick={handleRestore}
 className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md text-sm font-medium border border-emerald-200"
 title="Khôi phục"
 >
 <ArrowUturnLeftIcon className="w-4 h-4" />
 </button>
 )}

 {/* Nút Xóa (Dùng chung cho cả Soft Delete và Hard Delete) */}
 <button
 onClick={() => setIsConfirmingDelete(true)}
 className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded "
 title={isTrashView ? "Xóa vĩnh viễn" : "Xóa"}
 >
 <TrashIcon className="w-4 h-4" />
 </button>
 </>
 )}
 </div>
 </li>
 );
}

