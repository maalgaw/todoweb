"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { TodoItem, Category } from "../types";
import TodoForm from "../components/TodoForm";
import FilterBar from "../components/FilterBar";
import TodoListItem from "../components/TodoListItem";
import NavBar from "../components/NavBar";
import CategoryManager from "../components/CategoryManager";
import TrashView from "../components/TrashView";
//import TodoCalendar from "../components/TodoCalendar";

export default function Home() {
  //Lưu trữ tạm thời dữ liệu các công việc và thẻ
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [trashTodos, setTrashTodos] = useState<TodoItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  //Bộ lọc mặc định khi vào là all - tất cả
  const [filter, setFilter] = useState("all");

  //Bộ lọc tìm kiếm mặc định là rỗng
  const [searchQuery, setSearchQuery] = useState("");

  //Lưu trữ giá trị tạm thời của NavBar
  type Tab = "list" | "add" | "manage_categories" | "trash";
  //Mặc định là list - danh sách công việc
  const [currentTab, setCurrentTab] = useState<Tab>("list");

  //Chế độ sửa
  const [isManageMode, setIsManageMode] = useState(false);

  //Chế độ xem: danh sách hoặc lịch
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  //Hàm cập nhật danh sách công việc
  function fetchTodos() {
    axios
      .get("/api/todos")
      .then((res) => setTodos(res.data))
      .catch(() => toast.error("Không thể kết nối server API công việc"));
  }

  //Hàm cập nhật danh sách thẻ
  function fetchCategories() {
    axios
      .get("/api/categories")
      .then((res) => setCategories(res.data))
      .catch(() => toast.error("Không thể tải danh sách thẻ"));
  }

  //Hàm cập nhật danh sách thùng rác
  function fetchTrashTodos() {
    axios
      .get("/api/todos/trash")
      .then((res) => setTrashTodos(res.data))
      .catch(() => toast.error("Không thể tải danh sách thùng rác"));
  }

  //Hook lấy dữ liệu lần đầu vào trang
  useEffect(() => {
    fetchTodos();
    fetchCategories();
    fetchTrashTodos();
    toast("Chào mừng đến với app quản lý công việc!", {
      icon: "🎉",
    });
  }, []);

  //Xử lý khi ấn nút thêm
  async function handleAdd(
    title: string,
    dueDate: string,
    description: string,
    priority: number,
    categoryId: number | "",
  ) {
    await axios.post("/api/todos", {
      title,
      dueDate: dueDate || null,
      description,
      priority,
      categoryId: categoryId === "" ? null : categoryId,
    });
    fetchTodos();
    toast.success("Thêm công việc thành công");
    setCurrentTab("list");
  }

  //Xử lý khi ấn vào ô đánh dấu công việc
  async function handleCompleteToggle(todo: TodoItem) {
    await axios.put(`/api/todos/${todo.id}`, {
      ...todo,
      isCompleted: !todo.isCompleted,
    });
    fetchTodos();
    toast.success("Chỉnh sửa trạng thái công việc thành công!");
  }

  //Xử lý khi bấm nút xoá
  async function handleDelete(id: number) {
    const isConfirm = confirm("Bạn có chắc chắn muốn xóa công việc này không?");
    if (!isConfirm) return;

    await axios.delete(`/api/todos/${id}`);
    fetchTodos();
    fetchTrashTodos();
    toast.success("Đã đưa công việc vào thùng rác!");
  }

  //Xử lý khôi phục công việc
  async function handleRestore(todo: TodoItem) {
    await axios.put(`/api/todos/${todo.id}`, { ...todo, isDeleted: false });
    fetchTodos();
    fetchTrashTodos();
    toast.success("Đã khôi phục công việc!");
  }

  //Xử lý xoá vĩnh viễn
  async function handleHardDelete(id: number) {
    const isConfirm = confirm(
      "Bạn có chắc chắn muốn xóa vĩnh viễn công việc này không? Không thể khôi phục lại!",
    );
    if (!isConfirm) return;

    await axios.delete(`/api/todos/trash/${id}`);
    fetchTrashTodos();
    toast.success("Đã xoá vĩnh viễn!");
  }

  //Xử lý khi ấn nút sửa
  async function handleEdit(id: number, updatedData: TodoItem) {
    if (!confirm("Bạn có chắc chắn muốn lưu những sửa đổi này không?")) return;

    await axios.put(`/api/todos/${id}`, updatedData);
    fetchTodos();
    toast.success("Chỉnh sửa công việc thành công!");
  }

  //Kiểm tra quá hạn
  function isOverDue(dueDate?: string | null) {
    if (!dueDate) return false;
    return (
      new Date(dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
    );
  }

  //Lọc & tìm kiếm
  const filteredTodos = todos.filter((todo) => {
    if (
      searchQuery &&
      !todo.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (filter === "doing") {
      return todo.isCompleted === false && !isOverDue(todo.dueDate);
    } else if (filter === "completed") {
      return todo.isCompleted === true;
    } else if (filter === "overdue") {
      return todo.isCompleted === false && isOverDue(todo.dueDate);
    }
    return true;
  });

  //Đếm số công việc chưa hoàn thành
  const activeCount = todos.filter(
    (todo) => todo.isCompleted === false && !isOverDue(todo.dueDate),
  ).length;

  // Thống kê chung
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.isCompleted).length;

  return (
    <div>
      <NavBar currentTab={currentTab} onTabChange={setCurrentTab} />
      <div className="w-full px-4 sm:px-6 md:px-10 mt-8 mb-20">
        {/* Hộp thông báo của react-hot-toast */}
        <div>
          <Toaster position="top-right" reverseOrder={false} />
        </div>
        {/* Giao diện trang web thay đổi khi mở từ nav bar */}
        <AnimatePresence mode="wait">
          {/* Hiển thị giao diện khi ấn "Danh sách công việc" */}
          {currentTab === "list" && (
            <motion.div
              key="list-manage"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 tracking-tight">
                📝 DANH SÁCH CÔNG VIỆC
              </h1>

              {/* Bảng Thống kê 3 ô */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border border-gray-400 shadow-sm flex flex-col items-center justify-center transition-transform hover:shadow-md">
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    Tổng cộng
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {totalCount}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-400 shadow-sm flex flex-col items-center justify-center transition-transform hover:shadow-md">
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    Chưa xong (Còn hạn)
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {activeCount}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-400 shadow-sm flex flex-col items-center justify-center transition-transform hover:shadow-md">
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    Hoàn thành
                  </p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {completedCount}
                  </p>
                </div>
              </div>

              {/* Component hiển thị các nút bộ lọc */}
              <FilterBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filter={filter}
                setFilter={setFilter}
              />

              {/* Thanh công cụ phụ (Chế độ sửa, View Mode) */}
              {currentTab === "list" && (
                <div className="flex justify-between items-center mb-4">
                  {/* Công tắc chế độ sửa */}
                  <label className="flex items-center cursor-pointer select-none group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isManageMode}
                        onChange={() => setIsManageMode(!isManageMode)}
                      />
                      {/* Nền của công tắc */}
                      <div
                        className={`block w-14 h-8 rounded-full transition-colors duration-300 ease-in-out shadow-inner border border-black/10 ${
                          isManageMode ? "bg-emerald-500" : "bg-gray-300"
                        }`}
                      ></div>
                      {/* Hình tròn trượt */}
                      <div
                        className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out shadow-md flex items-center justify-center ${
                          isManageMode ? "transform translate-x-6" : ""
                        }`}
                      >
                        {isManageMode ? (
                          <svg
                            className="w-4 h-4 text-emerald-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          ></svg>
                        )}
                      </div>
                    </div>
                    {/* Chữ bên cạnh nút */}
                    <span
                      className={`ml-3 text-sm font-semibold transition-colors duration-200 ${
                        isManageMode
                          ? "text-emerald-600"
                          : "text-gray-500 group-hover:text-gray-700"
                      }`}
                    >
                      Chế độ sửa
                    </span>
                  </label>
                  {/* Chế độ xem: Danh sách / Lịch */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${
                        viewMode === "list"
                          ? "bg-emerald-600 text-white"
                          : "bg-white text-gray-700 border border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      📝 Danh sách
                    </button>
                  </div>
                </div>
              )}

              {/* Hiển thị dữ liệu các công việc */}
              {viewMode === "list" ? (
                <div className="bg-white p-3 rounded-xl border border-gray-400 shadow-inner bg-co">
                  <ul className="space-y-4 h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredTodos.map((todo) => (
                      //Mở component hiển thị danh sách công việc
                      <TodoListItem
                        key={todo.id}
                        todo={todo}
                        categories={categories}
                        onToggle={handleCompleteToggle}
                        onDelete={handleDelete}
                        onSave={handleEdit}
                        isManage={isManageMode}
                      />
                    ))}
                  </ul>
                </div>
              ) : (
                //Kiểu lịch
                //<TodoCalendar todos={filteredTodos} />
                <></>
              )}
            </motion.div>
          )}

          {/* Hiển thị giao diện khi ấn "Thêm công việc" */}
          {currentTab === "add" && (
            <motion.div
              key="add"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 tracking-tight">
                ➕ THÊM CÔNG VIỆC
              </h1>
              {/* Mở component form tạo mới công việc */}
              <TodoForm categories={categories} onAdd={handleAdd} />
            </motion.div>
          )}

          {/* Hiển thị giao diện khi ấn "Quản lý thẻ" */}
          {currentTab === "manage_categories" && (
            <motion.div
              key="manage_categories"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 tracking-tight">
                🏷️ QUẢN LÝ THẺ
              </h1>
              {/* Mở component quản lý thẻ */}
              <CategoryManager
                categories={categories}
                refreshCategories={fetchCategories}
              />
            </motion.div>
          )}

          {/* Hiển thị giao diện khi ấn "Thùng rác" */}
          {currentTab === "trash" && (
            <TrashView
              trashTodos={trashTodos}
              categories={categories}
              handleHardDelete={handleHardDelete}
              handleRestore={handleRestore}
              handleEdit={handleEdit}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
