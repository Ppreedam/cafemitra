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

export type PassportGender = "male" | "female";

export const passportVariationAttire: Record<string, string> = {
  same: "the same outfit visible in the uploaded photo",
  men_blazer_tie: "a formal blazer with a tie",
  women_blazer_tie: "a formal blazer with a tie",
  burqa: "a black burqa with hijab",
};

export function genderForPassportVariation(variation: string): PassportGender {
  return variation === "women_blazer_tie" || variation === "burqa" ? "female" : "male";
}

export function buildPassportPrompt(variation: string) {
  const gender = genderForPassportVariation(variation);
  const attire = passportVariationAttire[variation] || passportVariationAttire.same;
  return `Generate a professional ${gender} passport photo. Requirements: Plain white or very light gray background, face centered and looking straight at camera with neutral expression, both ears visible, proper even lighting with no shadows on face, shoulders and upper chest visible, wearing ${attire.toLowerCase()}, high resolution output. Aspect ratio 4:5. The photo must meet official government passport photo standards.`;
}
