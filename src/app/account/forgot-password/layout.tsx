import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Forgot Password",
  "Reset your Bollybee account password."
);

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
