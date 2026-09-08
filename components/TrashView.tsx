import { TodoItem, Category } from "../types";
import TodoListItem from "./TodoListItem";
import { TrashIcon, ArchiveBoxXMarkIcon } from "@heroicons/react/24/outline";

//Định nghĩa dữ liệu nhận từ component cha
interface Props {
  trashTodos: TodoItem[];
  categories: Category[];
  handleHardDelete: (id: number) => void;
  handleRestore: (todo: TodoItem) => void;
  handleEdit: (id: number, updatedData: TodoItem) => void;
}

export default function TrashView({
  trashTodos,
  categories,
  handleHardDelete,
  handleRestore,
  handleEdit,
}: Props) {
  return (
    <div
      key="trash"
      className="bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-sm rounded-2xl p-6 md:p-8 max-w-5xl mx-auto"
    >
      <h1 className="text-2xl font-semibold mb-6 text-gray-800 tracking-tight flex items-center gap-2">
        <TrashIcon className="w-6 h-6 text-red-500" /> Thùng rác
      </h1>

      <div className="bg-white md:px-2 rounded-xl mt-4">
        <ul className="space-y-0 h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {trashTodos.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 opacity-80 pt-20">
              <ArchiveBoxXMarkIcon className="w-16 h-16 text-emerald-400 drop-shadow-md" />
              <p className="text-xl font-bold text-gray-700">
                Thùng rác đang trống!
              </p>
              <p className="text-sm font-medium">
                Mọi thứ đều sạch sẽ và gọn gàng.
              </p>
            </div>
          ) : (
            trashTodos.map((todo) => (
              <TodoListItem
                key={todo.id}
                todo={todo}
                categories={categories}
                handleCompleteToggle={() => {}} // Không cho check khi ở trong thùng rác
                handleDelete={handleHardDelete}
                handleEdit={handleEdit}
                handleRestore={() => handleRestore(todo)}
                isTrashView={true}
              />
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
