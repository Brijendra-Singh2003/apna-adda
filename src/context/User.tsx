import { api } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import React, { createContext } from "react";

interface UserContext {
  user: User | undefined;
  isLoading: boolean;
}

const userContext = createContext<UserContext>({
  user: undefined,
  isLoading: true,
});

async function getUser() {
  const response = await api.get("/auth/check-session");
  return response.data.user;
}

export const UserContextProvider: React.FC<{
  children: Readonly<React.ReactNode>;
}> = ({ children }) => {
  const { data: user, isLoading } = useQuery({
    queryFn: getUser,
    queryKey: ["user"],
  });

  return (
    <userContext.Provider value={{ user, isLoading }}>
      {children}
    </userContext.Provider>
  );
};

export default userContext;
