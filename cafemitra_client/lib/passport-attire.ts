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

const passportVariationClothingInstruction: Record<string, string> = {
  same: "Keep the exact same clothing visible in the original photo. Do not replace, redesign, or alter the clothing in any way.",
  men_blazer_tie: "Replace clothing with a formal dark blazer, white shirt, and tie.",
  women_blazer_tie: "Replace clothing with a formal dark blazer, white shirt, and tie.",
  burqa: "Replace clothing with a black burqa and hijab, covering only the hair and body while keeping the entire face fully visible and unaltered.",
};

export function buildPassportPrompt(variation: string) {
  const clothingInstruction = passportVariationClothingInstruction[variation] || passportVariationClothingInstruction.same;

  return `Create a professional government-compliant passport photo from the provided image.

🚨 HIGHEST PRIORITY — PRESERVE THE EXACT SAME PERSON
Any condition need image ! important.
This is an IMAGE EDITING task only.
This is NOT a text-to-image generation task.
This is NOT a portrait recreation task.
This is NOT a face generation task.

The original face is LOCKED and MUST NOT be regenerated under any circumstances.

IDENTITY PRESERVATION (MANDATORY)

Preserve the exact same person from the source image.

The facial identity must remain 100% unchanged.

Do NOT generate a similar-looking person.

Do NOT reinterpret the face.

Do NOT synthesize missing facial details.

Do NOT replace any part of the face.
Any condition need image ! important.

The output must be instantly recognizable as the exact same individual.

If any edit would change the person's identity, DO NOT perform that edit.

The original facial geometry must remain unchanged.

Do NOT modify:

• facial structure
• face shape
• head shape
• forehead
• hairline
• hairstyle
• ears
• eyebrows
• eyelashes
• eyes
• iris color
• nose
• nostrils
• lips
• mouth
• teeth
• chin
• jawline
• cheeks
• cheekbones
• beard
• mustache
• facial proportions
• facial symmetry
• wrinkles
• moles
• freckles
• scars
• birthmarks
• skin tone
• skin texture
• age
• gender
• ethnicity
• expression
• gaze direction
• eye distance
• nose width
• lip thickness
• facial landmarks

DO NOT:

• perform face swap
• perform face replacement
• perform identity enhancement
• beautify the face
• retouch the face
• smooth skin
• sharpen facial features
• reconstruct the face
• redraw the face
• hallucinate facial details
• make the person more attractive
• change age
• de-age
• re-age
• stylize the portrait
• make the face more symmetrical
• apply AI portrait enhancement
• apply artistic interpretation
• change the person's identity in any way

Treat the face as read-only.

Imagine the face is protected and cannot be edited.
Only modify elements surrounding the face.

Allowed edits ONLY:

• Replace the background with pure white (#FFFFFF) or very light gray.
• Improve overall lighting only.
• Remove background shadows only.
• Keep the face perfectly centered.
• Ensure both ears are visible if possible without altering facial identity.
• ${clothingInstruction}
• Show shoulders and upper chest.
• Crop according to official passport framing.
• Produce a high-resolution passport photograph.
• Aspect Ratio: 4:5.

ABSOLUTE RULE

Identity preservation is more important than:
• realism
• beauty
• image quality
• enhancement
• symmetry
• sharpness
• lighting
• clothing replacement
• background replacement

If any enhancement would modify the face, SKIP THE ENHANCEMENT.

The final image must look like the SAME PERSON photographed in a professional passport studio, not an AI-generated version of that person.

NEGATIVE PROMPT:

face swap,
identity drift,
identity loss,
different person,
new person,
another person,
look-alike,
face replacement,
AI generated face,
generated face,
synthetic face,
reconstructed face,
reimagined face,
altered face,
modified face,
identity change,
identity alteration,
facial modification,
facial enhancement,
beautification,
beautified face,
portrait enhancement,
portrait stylization,
stylized face,
digital painting,
CGI,
illustration,
anime,
3D render,
de-aging,
re-aging,
age progression,
age regression,
skin smoothing,
airbrushed skin,
symmetry correction,
facial correction,
different nose,
different eyes,
different lips,
different jawline,
different chin,
different ears,
different forehead,
different hairline,
different hairstyle,
different eyebrows,
different beard,
different mustache,
different skin tone,
hallucinated facial details,
facial reconstruction,
facial regeneration,
portrait recreation,
identity recreation,
facial reinterpretation,
artistic interpretation,
face morphing,
deepfake,
AI face replacement,
face editing,
facial redesign,
facial reshaping,
beauty filter,
glamour retouch,
cosmetic enhancement`;
}
