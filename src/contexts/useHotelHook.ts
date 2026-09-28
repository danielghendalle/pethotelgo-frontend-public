import { useContext } from "react";
import { HotelContext } from "./contexts";
import type { HotelContextType } from "./HotelContext";

export function useHotel(): HotelContextType {
  const context = useContext(HotelContext);
  if (context === undefined) {
    throw new Error("useHotel must be used within a HotelProvider");
  }
  return context;
}
