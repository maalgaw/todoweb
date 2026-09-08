import {
  SunIcon,
  StarIcon,
  PlayCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface SidebarFiltersProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function SidebarFilters({
  currentFilter,
  onFilterChange,
}: SidebarFiltersProps) {
  const menuItems = [
    {
      id: "today",
      label: "Trong ngày",
      icon: <SunIcon className="w-5 h-5 text-orange-500" />,
    },
    {
      id: "important",
      label: "Quan trọng",
      icon: <StarIcon className="w-5 h-5 text-yellow-500" />,
    },
    {
      id: "doing",
      label: "Đang làm",
      icon: <PlayCircleIcon className="w-5 h-5 text-blue-500" />,
    },
    {
      id: "completed",
      label: "Đã hoàn thành",
      icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
    },
    {
      id: "overdue",
      label: "Quá hạn",
      icon: <ClockIcon className="w-5 h-5 text-red-500" />,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {/* Main filters */}
      <ul className="p-4 space-y-1">
        {menuItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onFilterChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                currentFilter === item.id
                  ? "bg-emerald-100 text-emerald-800"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {item.label}
            </button>
          </li>
        ))}

        <li className="pt-2 mt-2 border-t border-gray-200">
          <button
            onClick={() => onFilterChange("trash")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
              currentFilter === "trash"
                ? "bg-red-50 text-red-700"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <TrashIcon
              className={`w-5 h-5 ${currentFilter === "trash" ? "text-red-600" : "text-gray-500"}`}
            />
            Thùng rác
          </button>
        </li>
      </ul>
    </div>
  );
}
