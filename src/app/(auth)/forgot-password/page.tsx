import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default async function ForgotPasswordPage() {
  const user = await getSessionUser();
  if (user) redirect("/boards");

  return <ForgotPasswordForm />;
}
