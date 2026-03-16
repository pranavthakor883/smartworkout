import { createContext, useContext, useState, ReactNode } from "react";

type UserData = {
  name: string;
  email: string;
  age: string;
  height: string;
  weight: string;
  fitnessGoal: string;
  activityLevel: string;
};

type UserContextType = {
  user: UserData | null;
  setUser: (data: UserData) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(
    localStorage.getItem("userData")
      ? JSON.parse(localStorage.getItem("userData")!)
      : null
  );

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};