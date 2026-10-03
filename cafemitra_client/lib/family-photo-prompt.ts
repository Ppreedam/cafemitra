// Fixed prompt for the Family Passport Photo AI merge - unlike the single
// passport photo tool (buildPassportPrompt), there is no attire/variation
// picker here, so this is a single constant sent as-is to the backend.
export function buildFamilyPhotoPrompt(photoCount: number) {
  return `Create a single realistic family group passport-style studio photograph by combining all ${photoCount} uploaded individual photos into one image.

Highest priority: preserve identity and include every uploaded person correctly
- Each uploaded photo represents one different real person.
- Every uploaded person must appear in the final image exactly once.
- Do not omit any person.
- Do not duplicate any person.
- Do not repeat one person's face for another person.
- Do not merge identities.
- The final family photo must contain exactly ${photoCount} unique people - the same number as the number of uploaded input photos.

Composition and style
- Arrange everyone naturally as a real family group portrait - standing close together, front row and back row if the group is large, all facing the camera.
- Use a plain, light, evenly lit studio background, similar to a professional passport/studio photograph.
- Keep each person's face, skin tone, hairstyle, and facial features exactly as in their own uploaded photo.
- Give everyone a neutral, pleasant expression and even, shadow-free studio lighting.
- Output a single high-resolution, photorealistic image suitable for printing.`;
}
