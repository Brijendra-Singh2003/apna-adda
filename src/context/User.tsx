import { api } from "@/lib/constants";
import React, { createContext, useEffect, useState } from "react";

interface UserContext {
  user: User | undefined;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
}

const userContext = createContext<UserContext>({
  user: undefined,
  setUser: () => {},
});

export const UserContextProvider: React.FC<{
  children: Readonly<React.ReactNode>;
}> = ({ children }) => {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    api
      .get("/auth/check-session")
      .then((response) => setUser(response.data.user))
      .catch((error) => {
        console.error(error);
        setUser(undefined);
      });
  }, []);

  return (
    <userContext.Provider value={{ user, setUser }}>
      {children}
    </userContext.Provider>
  );
};

export default userContext;
