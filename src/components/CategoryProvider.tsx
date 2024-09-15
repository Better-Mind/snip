import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the context type
export interface CurrentCategoryContextType {
  currentCategory: string;
  setCurrentCategory: React.Dispatch<React.SetStateAction<string>>;
}


// Create a context object
export const CurrentCategory = createContext<CurrentCategoryContextType | undefined>(undefined);

// Create a provider component
export const CurrentCategoryProvider: React.FC<{ children: ReactNode }>  = ({ children }) => {
  const [currentCategory, setCurrentCategory] = useState("Home");

  return (
    <CurrentCategory.Provider value={{ currentCategory, setCurrentCategory }}>
      {children}
    </CurrentCategory.Provider>
  );
};

// Custom hook to use the context
export const useCurrentCategory = (): CurrentCategoryContextType => {
  const context = useContext(CurrentCategory);
  if (!context) {
    throw new Error('useCurrentCategory must be used within a CurrentCategoryProvider');
  }
  return context;
};