import { motion } from "framer-motion";
import { TodoItem, Category } from "../types";
import TodoListItem from "./TodoListItem";

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
    <motion.div
      key="trash"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 tracking-tight">
        🗑️ THÙNG RÁC
      </h1>

      <div className="bg-white p-3 rounded-xl border border-gray-400 shadow-inner bg-co">
        <ul className="space-y-4 h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
          {trashTodos.length === 0 && (
            <p className="text-center mt-8 text-gray-500 font-medium text-lg">
              Thùng rác trống
            </p>
          )}
          {trashTodos.map((todo) => (
            <TodoListItem
              key={todo.id}
              todo={todo}
              categories={categories}
              handleCompleteToggle={() => {}} // Không cho check khi ở trong thùng rác
              handleDelete={handleHardDelete}
              handleEdit={handleEdit}
              handleRestore={() => handleRestore(todo)}
              isManage={false}
              isTrashView={true}
            />
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
