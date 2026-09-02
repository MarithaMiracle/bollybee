import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Reset Password",
  "Set a new password for your Bollybee account."
);

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
