import { permanentRedirect } from "next/navigation";

// The owner upload tool now lives at the SEO-friendly /photo-copy route; the
// old address keeps working for existing bookmarks. Permanent (308) so search
// engines move the old URL's signals to /photo-copy.
export default function PrintDeskPage() {
  permanentRedirect("/photo-copy");
}
