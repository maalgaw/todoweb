//Định nghĩa thanh navbar
interface Props {
  currentTab: "list" | "add" | "manage_todos" | "manage_categories";
  onTabChange: (
    tab: "list" | "add" | "manage_todos" | "manage_categories",
  ) => void;
}

export default function NavBar({ currentTab, onTabChange }: Props) {
  const tabs = [
    { id: "list", label: "Danh sách công việc" },
    { id: "manage_todos", label: "Quản lý công việc" },
    { id: "add", label: "Thêm công việc" },
    { id: "manage_categories", label: "Quản lý thẻ" },
  ] as const;

  return (
    <nav className="bg-white/20 backdrop-blur-md shadow-sm border-b border-gray-400 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16">
          {/* Cụm Logo */}
          <div className="flex shrink-0 items-center mr-4 sm:mr-8 select-none">
            <span className="text-xl font-black text-emerald-600 tracking-tighter flex items-center gap-2">
              <span className="text-2xl drop-shadow-sm">📒</span>
              <span className="hidden sm:block">TodoApp</span>
            </span>
          </div>

          {/* Cụm Tabs */}
          <div className="flex flex-1 overflow-x-auto overflow-y-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`shrink-0 inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
                  currentTab === tab.id
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
