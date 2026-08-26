import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Category } from "../types";

//Định nghĩa dữ liệu chuyền từ component cha
interface Props {
  categories: Category[];
  refreshCategories: () => void;
}

export default function CategoryManager({
  //Destructuring
  categories,
  refreshCategories,
}: Props) {
  //Mặc định ô điền tên thẻ mới, các ô sửa luôn trống
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  //Xử lý thêm thẻ
  const handleAdd = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Tên thẻ không được để trống");
      return;
    }
    try {
      await axios.post("/api/categories", { name: newCategoryName.trim() });
      setNewCategoryName("");
      refreshCategories();
      toast.success("Thêm thẻ thành công");
    } catch {
      toast.error("Lỗi khi thêm thẻ");
    }
  };

  //Xử lý xoá thẻ
  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Bạn có chắc muốn xóa thẻ này? Các công việc dùng thẻ này sẽ bị gỡ thẻ.",
      )
    )
      return;
    try {
      await axios.delete(`/api/categories/${id}`);
      refreshCategories();
      toast.success("Đã xóa thẻ");
    } catch {
      toast.error("Lỗi khi xóa thẻ");
    }
  };

  //Truyền vào ô sửa giá trị của thẻ đang sửa
  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  //Xử lý lưu sau khi sửa thẻ
  const handleSaveEdit = async (id: number) => {
    if (!editName.trim()) {
      toast.error("Tên thẻ không được để trống");
      return;
    }
    try {
      await axios.put(`/api/categories/${id}`, { id, name: editName.trim() });
      setEditingId(null);
      refreshCategories();
      toast.success("Đã cập nhật thẻ");
    } catch {
      toast.error("Lỗi khi cập nhật thẻ");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-400">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Quản lý thẻ phân loại
      </h2>
      {/* Form thêm thẻ mới */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Nhập tên thẻ mới..."
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 px-4 py-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium transition-colors"
        >
          Thêm
        </button>
      </div>

      {/* Hiển thị danh sách các thẻ */}
      <ul className="space-y-3">
        {/* Nếu không có */}
        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Chưa có thẻ nào.</p>
        ) : (
          categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-400 rounded-md hover:shadow-md transition-all duration-200"
            >
              {/* Form sửa thẻ mở ra nếu được truyền vào id thẻ */}
              {editingId === category.id ? (
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleSaveEdit(category.id)}
                    className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <>
                  {/* Thông tin thẻ */}
                  <span className="font-medium text-gray-700">
                    🏷️ {category.name}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartEdit(category)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors border border-blue-200"
                      title="Sửa"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors border border-red-200"
                      title="Xóa"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
