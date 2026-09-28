import { createContext } from "react";
import { HotelContextType } from "./HotelContext";
import { AuthContextType } from "./AuthContext";

export type { HotelContextType, AuthContextType };

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
export const HotelContext = createContext<HotelContextType | undefined>(
  undefined,
);
