import { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({ name: "", phone: "" });

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const storedName = await AsyncStorage.getItem("name");
      const storedPhone = await AsyncStorage.getItem("phone");

      if (storedName && storedPhone) {
        setUser({ name: storedName, phone: storedPhone });
      }
    };

    loadUserFromStorage();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
