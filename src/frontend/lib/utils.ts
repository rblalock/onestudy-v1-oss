import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fetchImage = async (url: string) => {
  const imageResponse = await fetch(url, {
    method: "GET",
  });

  return await imageResponse.text();
}
