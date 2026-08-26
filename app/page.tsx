"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { TodoItem, Category } from "../types";
import TodoForm from "../components/TodoForm";
import FilterBar from "../components/FilterBar";
import TodoListItem from "../components/TodoListItem";
import NavBar from "../components/NavBar";
import CategoryManager from "../components/CategoryManager";
//import TodoCalendar from "../components/TodoCalendar";

export default function Home() {
  //Lưu trữ tạm thời dữ liệu các công việc và thẻ
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  //Bộ lọc mặc định khi vào là all - tất cả
  const [filter, setFilter] = useState("all");

  //Bộ lọc tìm kiếm mặc định là rỗng
  const [searchQuery, setSearchQuery] = useState("");

  //Lưu trữ giá trị tạm thời của NavBar
  type Tab = "list" | "add" | "manage_todos" | "manage_categories";
  //Mặc định là list - danh sách công việc
  const [currentTab, setCurrentTab] = useState<Tab>("list");

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

  //Hook lấy dữ liệu lần đầu vào trang
  useEffect(() => {
    fetchTodos();
    fetchCategories();
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
    toast.success("Đã xoá công việc!");
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

  //Hiển thị tuỳ số lượng công việc chưa hoàn thành
  function renderStatusText() {
    if (todos.length === 0)
      return (
        <p className="text-center mt-8 text-gray-500 font-medium text-lg">
          Bạn không có công việc nào
        </p>
      );
    if (activeCount === 0)
      return (
        <p className="text-center mt-8 text-gray-500 font-medium text-lg">
          Bạn đã hoàn thành hết các công việc
        </p>
      );
    return (
      <p className="text-center mt-8 text-gray-500 font-medium text-lg">
        Còn {activeCount} việc chưa hoàn thành
      </p>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar currentTab={currentTab} onTabChange={setCurrentTab} />
      <div className="w-full px-4 sm:px-6 md:px-10 mt-8 mb-20">
        {/* Hộp thông báo của react-hot-toast */}
        <div>
          <Toaster position="top-right" reverseOrder={false} />
        </div>
        {/* Giao diện trang web thay đổi khi mở từ nav bar */}
        {/* Hiển thị giao diện khi ấn "Danh sách công việc" hoặc "Quản lý công việc"*/}
        {(currentTab === "list" || currentTab === "manage_todos") && (
          <div>
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 tracking-tight">
              {currentTab === "list"
                ? "📝 DANH SÁCH CÔNG VIỆC"
                : "⚙️ QUẢN LÝ CÔNG VIỆC"}
            </h1>

            {/* Bảng Thống kê 3 ô */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center transition-transform hover:scale-105">
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Tổng cộng
                </p>
                <p className="text-3xl font-bold text-gray-800">{totalCount}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center transition-transform hover:scale-105">
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Chưa xong (Còn hạn)
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {activeCount}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center transition-transform hover:scale-105">
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

            {/* Nút chuyển đổi View Mode (Chỉ hiện ở Tab Danh sách) */}
            {currentTab === "list" && (
              <div className="flex justify-end mb-4 space-x-2">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${
                    viewMode === "list"
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  📝 Danh sách
                </button>
                {/*
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${
                    viewMode === "calendar"
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  📅 Lịch
                </button>
                */}
              </div>
            )}

            {/* Hiển thị dữ liệu các công việc */}
            {viewMode === "list" || currentTab === "manage_todos" ? (
              <div className="bg-white/50 p-3 rounded-xl border border-gray-200 shadow-inner">
                <ul className="space-y-4 h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredTodos.map((todo) => (
                    //Mở component hiển thị danh sách công việc
                    <TodoListItem
                      key={todo.id}
                      todo={todo}
                      categories={categories}
                      onToggle={handleCompleteToggle}
                      onDelete={handleDelete}
                      onSave={handleEdit}
                      isManage={currentTab === "manage_todos"}
                    />
                  ))}
                </ul>
              </div>
            ) : (
              //Kiểu lịch
              //<TodoCalendar todos={filteredTodos} />
              <></>
            )}
            {/* Hiển thị số lượng công việc */}
            {renderStatusText()}
          </div>
        )}

        {/* Hiển thị giao diện khi ấn "Thêm công việc" */}
        {currentTab === "add" && (
          <div>
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 tracking-tight">
              ➕ THÊM CÔNG VIỆC
            </h1>
            {/* Mở component form tạo mới công việc */}
            <TodoForm categories={categories} onAdd={handleAdd} />
          </div>
        )}

        {/* Hiển thị giao diện khi ấn "Quản lý thẻ" */}
        {currentTab === "manage_categories" && (
          <div>
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 tracking-tight">
              🏷️ QUẢN LÝ THẺ
            </h1>
            {/* Mở component quản lý thẻ */}
            <CategoryManager
              categories={categories}
              refreshCategories={fetchCategories}
            />
          </div>
        )}
      </div>
    </div>
  );
}
