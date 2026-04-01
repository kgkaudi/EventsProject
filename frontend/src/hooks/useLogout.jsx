import { useAuthContext } from "./useAuthContext";

export const useLogout = () => {
  const { logout } = useAuthContext();

  const handleLogout = () => {
    logout();
  };

  return { logout: handleLogout };
};