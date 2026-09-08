"use client";

import { useState, useEffect } from "react";
import api from "../lib/axiosConfig";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import toast, { Toaster } from "react-hot-toast";

import { TodoItem, Category } from "../types";
import TodoForm from "../components/TodoForm";
import TodoListItem from "../components/TodoListItem";
import { RecurrenceConfig } from "../components/RecurrenceSelector";
import Sidebar from "../components/Sidebar";
import TrashView from "../components/TrashView";
import {
  SunIcon,
  StarIcon,
  PlayCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  HashtagIcon,
  SparklesIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

export default function Home() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [trashTodos, setTrashTodos] = useState<TodoItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [filter, setFilter] = useState("doing");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated === false) {
        router.push("/login");
      } else if (user?.role === "Admin") {
        router.push("/admin");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  function fetchTodos() {
    api
      .get("/api/todos")
      .then((res) => setTodos(res.data))
      .catch(() => toast.error("Không thể kết nối server API công việc"));
  }

  function fetchCategories() {
    api
      .get("/api/categories")
      .then((res) => setCategories(res.data))
      .catch(() => toast.error("Không thể tải danh sách thẻ"));
  }

  function fetchTrashTodos() {
    api
      .get("/api/todos/trash")
      .then((res) => setTrashTodos(res.data))
      .catch(() => toast.error("Không thể tải danh sách thùng rác"));
  }

  useEffect(() => {
    fetchTodos();
    fetchCategories();
    fetchTrashTodos();
    if (!sessionStorage.getItem("welcomeShown")) {
      toast("Chào mừng đến với app quản lý công việc!", { icon: "🎉" });
      sessionStorage.setItem("welcomeShown", "true");
    }
  }, []);

  async function handleAdd(
    title: string,
    dueDate: string,
    description: string,
    priority: number,
    categoryId: number | "",
    recurrenceConfig?: RecurrenceConfig,
  ) {
    await api.post("/api/todos", {
      title,
      dueDate: dueDate || null,
      description,
      priority,
      categoryId: categoryId === "" ? null : categoryId,
      ...(recurrenceConfig || {}),
    });
    fetchTodos();
    toast.success("Thêm công việc thành công");
  }

  async function handleCompleteToggle(todo: TodoItem) {
    await api.put(`/api/todos/${todo.id}`, {
      ...todo,
      isCompleted: !todo.isCompleted,
    });
    fetchTodos();
    toast.success("Chỉnh sửa trạng thái công việc thành công!");
  }

  async function handleDelete(id: number) {
    await api.delete(`/api/todos/${id}`);
    fetchTodos();
    fetchTrashTodos();
    toast.success("Đã đưa công việc vào thùng rác!");
  }

  async function handleRestore(todo: TodoItem) {
    await api.put(`/api/todos/${todo.id}`, { ...todo, isDeleted: false });
    fetchTodos();
    fetchTrashTodos();
    toast.success("Đã khôi phục công việc!");
  }

  async function handleHardDelete(id: number) {
    await api.delete(`/api/todos/trash/${id}`);
    fetchTrashTodos();
    toast.success("Đã xoá vĩnh viễn!");
  }

  async function handleEdit(id: number, updatedData: TodoItem) {
    await api.put(`/api/todos/${id}`, updatedData);
    fetchTodos();
  }

  async function handleAddCategory(name: string) {
    try {
      await api.post("/api/categories", { name });
      fetchCategories();
      toast.success("Thêm thẻ thành công");
    } catch {
      toast.error("Lỗi khi thêm thẻ");
    }
  }

  async function handleEditCategory(id: number, name: string) {
    try {
      await api.put(`/api/categories/${id}`, { id, name });
      fetchCategories();
      fetchTodos();
      toast.success("Cập nhật thẻ thành công");
    } catch {
      toast.error("Lỗi khi cập nhật thẻ");
    }
  }

  async function handleDeleteCategory(id: number) {
    if (
      !confirm(
        "Bạn có chắc muốn xóa thẻ này? Các công việc dùng thẻ này sẽ bị gỡ thẻ.",
      )
    )
      return;
    try {
      await api.delete(`/api/categories/${id}`);
      fetchCategories();
      fetchTodos();
      if (filter === `category_${id}`) setFilter("today");
      toast.success("Đã xóa thẻ");
    } catch {
      toast.error("Lỗi khi xóa thẻ");
    }
  }

  function isOverDue(dueDate?: string | null) {
    if (!dueDate) return false;
    return (
      new Date(dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
    );
  }

  function isDueToday(dueDate?: string | null) {
    if (!dueDate) return false;
    return (
      new Date(dueDate).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
    );
  }

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
    } else if (filter === "today") {
      return isDueToday(todo.dueDate);
    } else if (filter === "important") {
      return todo.isPinned === true;
    } else if (filter.startsWith("category_")) {
      const catId = Number(filter.split("_")[1]);
      return todo.categoryId === catId;
    }
    return true; // all
  });

  const getPageTitle = () => {
    switch (filter) {
      case "today":
        return (
          <>
            <SunIcon className="w-6 h-6 text-orange-500" /> Trong ngày
          </>
        );
      case "important":
        return (
          <>
            <StarIcon className="w-6 h-6 text-yellow-500" /> Quan trọng
          </>
        );
      case "doing":
        return (
          <>
            <PlayCircleIcon className="w-6 h-6 text-blue-500" /> Đang làm
          </>
        );
      case "completed":
        return (
          <>
            <CheckCircleIcon className="w-6 h-6 text-green-500" /> Đã hoàn thành
          </>
        );
      case "overdue":
        return (
          <>
            <ClockIcon className="w-6 h-6 text-red-500" /> Quá hạn
          </>
        );
      default:
        if (filter.startsWith("category_")) {
          const cat = categories.find(
            (c) => c.id === Number(filter.split("_")[1]),
          );
          return cat ? (
            <>
              <HashtagIcon className="w-6 h-6 text-emerald-500" /> {cat.name}
            </>
          ) : (
            "Danh sách"
          );
        }
        return "Danh sách";
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        currentFilter={filter}
        onFilterChange={(f) => {
          setFilter(f);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        user={user}
        onLogout={logout}
      />

      <main className="flex-1 overflow-y-auto relative p-4 sm:p-6 md:p-8 custom-scrollbar">
        <Toaster
          position="bottom-center"
          reverseOrder={true}
          toastOptions={{ duration: 1500 }}
        />

        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-10 p-2 bg-white rounded-md shadow-sm border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            title="Mở thanh bên"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
        )}

        <div>
          {filter === "trash" ? (
            <TrashView
              trashTodos={trashTodos}
              categories={categories}
              handleHardDelete={handleHardDelete}
              handleRestore={handleRestore}
              handleEdit={handleEdit}
            />
          ) : (
            <>
              <div
                className={`bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-sm rounded-2xl p-6 md:p-8 w-full ${!isSidebarOpen ? "mt-12" : ""}`}
              >
                <h1 className="text-2xl font-semibold mb-6 text-gray-800 tracking-tight flex items-center gap-2">
                  {getPageTitle()}
                </h1>

                <div className="bg-white md:px-2 rounded-xl">
                  <ul className="space-y-0 h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredTodos.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 opacity-80 pt-20">
                        <SparklesIcon className="w-16 h-16 text-emerald-400 drop-shadow-md" />
                        <p className="text-xl font-bold text-gray-700">
                          Không có công việc nào!
                        </p>
                      </div>
                    ) : (
                      filteredTodos.map((todo) => (
                        <TodoListItem
                          key={todo.id}
                          todo={todo}
                          categories={categories}
                          handleCompleteToggle={handleCompleteToggle}
                          handleDelete={handleDelete}
                          handleEdit={handleEdit}
                        />
                      ))
                    )}
                  </ul>
                </div>
              </div>

              <div className={`w-full ${!isSidebarOpen ? "mt-4" : "mt-4"}`}>
                <TodoForm categories={categories} onAdd={handleAdd} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
