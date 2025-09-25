import { createContext, useContext, useState } from "react";
import {
  Home,
  ChevronFirst,
  ChevronLast,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  Building2,
  BanknoteArrowDown,
  BanknoteArrowUp,
} from "lucide-react";

import ToolTip from "./Auxiliares/ToolTip";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logo from "../media/logo.png";

// Props
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  path?: string;
  children?: { label: string; path: string }[];
  isOpenSubmenu: boolean;
  onToggle: () => void;
}

const SidebarContext = createContext<{ isOpen: boolean } | undefined>(undefined);

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);

  const menuItems = [
    { label: "Home", icon: <Home />, path: "/" },
    { label: "Clientes", icon: <Building2 />, path: "/cadastro/empresa" },
    { label: "Faturamento", icon: <BanknoteArrowUp />, path: "/faturamento"},
    { label: "Despesas", icon: <BanknoteArrowDown />, path: "/despesas"},
  ];

  return (
    <aside className={`min-h-screen max-h-screen transition-all duration-300 ${isOpen ? "w-64" : "w-20"}`}>
      <nav className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className={`flex items-center h-16 px-4 ${isOpen ? "justify-between" : "justify-center"}`}>
          {isOpen && (
            <button className="mx-auto" onClick={() => navigate("/")}>
              <img src={logo} alt="logo" className="w-10 h-10" />
            </button>
          )}
          <ToolTip text={isOpen ? "Minimizar" : "Expandir"} position="right" key={isOpen ? "open" : "closed"}>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
            >
              {isOpen ? <ChevronFirst size={18} /> : <ChevronLast size={18} />}
            </button>
          </ToolTip>
        </div>

        <SidebarContext.Provider value={{ isOpen }}>
          <ul className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {menuItems
              .map(item => {
                return (
                  <SidebarItem
                    key={item.label}
                    icon={item.icon}
                    text={item.label}
                    path={item.path}
                    //children={item.children}
                    isOpenSubmenu={openMenuKey === item.label}
                    onToggle={() => setOpenMenuKey(openMenuKey === item.label ? null : item.label)}
                  />
                );
              })}

          </ul>
        </SidebarContext.Provider>

        {/* Footer */}
        <div className="p-3 mt-auto">
          <div className={`flex ${isOpen ? "items-center gap-3" : "flex-col items-center"}`}>
            {isOpen ? (
              <>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{user?.nome}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <ToolTip text="Configurações" position="top">
                    <button onClick={() => navigate("/configuracoes")}>
                      <Settings className="text-gray-400 hover:text-gray-700" size={16} />
                    </button>
                  </ToolTip>
                  <ToolTip text="Sair" position="top">
                    <button onClick={logout}>
                      <LogOut className="text-gray-400 hover:text-gray-700" size={16} />
                    </button>
                  </ToolTip>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <ToolTip text="Configurações" position={`${isOpen ? 'top' : 'right'}`}>
                  <button className="cursor-pointer" onClick={() => navigate("/configuracoes")}>
                    <Settings className="text-gray-400 hover:text-gray-700" size={16} />
                  </button>
                </ToolTip>
                <ToolTip text="Sair" position={`${isOpen ? 'top' : 'right'}`}>
                  <button className="cursor-pointer" onClick={logout}>
                    <LogOut className="text-gray-400 hover:text-gray-700" size={16} />
                  </button>
                </ToolTip>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">v 1.0.0</p>
        </div>
      </nav>
    </aside>
  );
}

function SidebarItem({ icon, text, path, children, isOpenSubmenu, onToggle }: SidebarItemProps) {
  const { isOpen } = useContext(SidebarContext)!;
  const location = useLocation();
  const navigate = useNavigate();
  const [openPopover, setOpenPopover] = useState(false);
  const isActive = (() => {
    if (!path) return false;
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  })();

  const renderSubmenu = () => (
    isOpenSubmenu && (
      <div className="w-full rounded px-5 py-1 select-none">
        <div className="space-y-1 border-l-1 border-orange-400 border-primary mt-1">
          {children?.map((child) => (
            <Link key={child.label} to={child.path} onClick={() => onToggle()}>
              <div className={`ml-4 text-sm px-2 py-1 rounded hover:bg-gray-100 ${location.pathname === child.path ? "text-orange-700 font-semibold" : "text-gray-600"}`}>
                {child.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  );

  const renderPopover = () => (
    <>
      <div className="fixed inset-0 left-20 backdrop-blur-xs z-40" onClick={() => setOpenPopover(false)} />
      <div className="absolute left-full top-0 ml-3 bg-white border border-gray-300 shadow-md rounded p-2 z-50 min-w-[150px]">
        {children?.map((child) => (
          <Link key={child.label} to={child.path} onClick={() => setOpenPopover(false)}>
            <div className={`text-sm px-2 py-1 rounded hover:bg-gray-100 whitespace-nowrap ${location.pathname === child.path ? "text-sky-700 font-semibold" : "text-gray-600"}`}>
              {child.label}
            </div>
          </Link>
        ))}
      </div>
    </>
  );

  return (
    <li className="relative">
      {children ? (
        <div
          onClick={() => {
            if (isOpen) {
              onToggle();
              if (path) navigate(path);
            } else {
              setOpenPopover(!openPopover);
            }
          }}
          className={`flex p-2 cursor-pointer rounded transition-all ${isOpen ? "items-center" : "flex-col items-center justify-center"} ${isActive ? "border-l-4 border-orange-700 text-gray-600 hover:text-orange-700" : "text-gray-600 hover:text-gray-800"}`}
        >
          <span className={`text-xl ${isOpen ? "" : "mb-1"}`}>{icon}</span>
          {isOpen && (
            <>
              <span className="ml-3 text-sm font-medium flex-1">{text}</span>
              {isOpenSubmenu ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronUp size={16} className="text-gray-400" />}
            </>
          )}
        </div>
      ) : (
        <Link to={path!}>
          <div
            className={`flex p-2 cursor-pointer rounded transition-all ${isOpen ? "items-center" : "flex-col items-center justify-center"} ${isActive ? "border-l-4 border-orange-500 text-gray-600 hover:text-gray-700" : "text-gray-600 hover:text-gray-800"}`}
          >
            <span className={`text-xl ${isOpen ? "" : "mb-1"}`}>
              {!isOpen ? <ToolTip text={text} position="right">{icon}</ToolTip> : icon}
            </span>
            {isOpen && <span className="ml-3 text-sm font-medium transition-all">{text}</span>}
          </div>
        </Link>
      )}

      {isOpen && children && renderSubmenu()}
      {!isOpen && openPopover && children && renderPopover()}
    </li>
  );
}