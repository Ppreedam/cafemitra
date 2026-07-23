import { Image as ImageIcon, Shirt, UserRound, type LucideIcon } from "lucide-react";

export type PassportAttireOption = {
  key: string;
  label: string;
  icon: LucideIcon;
};

export const passportAttireOptions: PassportAttireOption[] = [
  { key: "same", label: "Same as Photo", icon: ImageIcon },
  { key: "men_blazer_tie", label: "Blazer & Tie (Men)", icon: Shirt },
  { key: "women_blazer_tie", label: "Blazer & Tie (Women)", icon: Shirt },
  { key: "burqa", label: "Burqa", icon: UserRound },
];

export const passportAttireLabels: Record<string, string> = Object.fromEntries(
  passportAttireOptions.map((option) => [option.key, option.label]),
);
