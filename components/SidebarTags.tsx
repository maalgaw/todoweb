import { useState } from "react";
import { Category } from "../types";
import { ChevronUpIcon, HashtagIcon, PlusIcon } from "@heroicons/react/24/outline";
import { PencilIcon, TrashIcon as TrashIconSolid } from "@heroicons/react/24/solid";

interface SidebarTagsProps {
  categories: Category[];
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  onAddCategory: (name: string) => void;
  onEditCategory?: (id: number, name: string) => void;
  onDeleteCategory?: (id: number) => void;
}

export default function SidebarTags({
  categories,
  currentFilter,
  onFilterChange,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: SidebarTagsProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName("");
    }
  };

  return (
    <div className="p-4 border-t border-gray-200">
      <div 
        className="flex items-center justify-between mb-2 cursor-pointer group"
        onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
      >
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider group-hover:text-gray-700 transition-colors">
          Thẻ phân loại
        </span>
        <button className="text-gray-400 hover:text-gray-600 focus:outline-none">
          <ChevronUpIcon className={`w-4 h-4 transition-transform duration-200 ${isCategoriesOpen ? "rotate-180" : ""}`} />
        </button>
      </div>
      
      {isCategoriesOpen && (
        <div className="space-y-1">
          <div className="mb-2 relative group">
            <input
              type="text"
              placeholder="Nhập và ấn Enter để thêm thẻ..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCategory();
              }}
              className="w-full pl-3 pr-8 py-1.5 bg-gray-100 border-transparent rounded-md text-sm focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <button
              onClick={handleAddCategory}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Thêm thẻ"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>

          <ul className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {categories.map((cat) => (
              <li key={cat.id}>
                {editingCategoryId === cat.id ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md">
                    <HashtagIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          onEditCategory?.(cat.id, editingCategoryName);
                          setEditingCategoryId(null);
                        }
                      }}
                      onBlur={() => {
                        onEditCategory?.(cat.id, editingCategoryName);
                        setEditingCategoryId(null);
                      }}
                      autoFocus
                      className="w-full text-sm border-b-2 border-emerald-500 focus:outline-none bg-transparent"
                    />
                  </div>
                ) : (
                  <div className="flex items-center relative group">
                    <button
                      onClick={() => onFilterChange(`category_${cat.id}`)}
                      className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        currentFilter === `category_${cat.id}`
                          ? "bg-emerald-100 text-emerald-800 font-medium"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <HashtagIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="truncate">{cat.name}</span>
                    </button>
                    <div className="absolute right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCategoryId(cat.id);
                          setEditingCategoryName(cat.name);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                        title="Sửa thẻ"
                      >
                        <PencilIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCategory?.(cat.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                        title="Xóa thẻ"
                      >
                        <TrashIconSolid className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
