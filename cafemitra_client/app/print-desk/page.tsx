import { redirect } from "next/navigation";

// The owner upload tool now lives at the SEO-friendly /photo-copy route; the
// old address keeps working for existing bookmarks.
export default function PrintDeskPage() {
  redirect("/photo-copy");
}
