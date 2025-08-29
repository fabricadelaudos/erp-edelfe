import { useAuth } from "../../contexts/AuthContext";

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white">
      <h1 className="text-xl font-bold mb-4 text-orange-400">
        Bem-vindo ao ERP da e-Delfe, {user?.email}
      </h1>
      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Sair
      </button>
    </div>
  );
}
