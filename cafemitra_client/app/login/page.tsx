import type { Metadata } from "next";
import { AuthPanel } from "../auth/AuthPanel";

export const metadata: Metadata = {
  title: "Login | RepetiGo",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <AuthPanel mode="login" />;
}
