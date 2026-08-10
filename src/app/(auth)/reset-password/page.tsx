import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default async function ResetPasswordPage() {
  const user = await getSessionUser();
  if (user) redirect("/boards");

  return <ResetPasswordForm />;
}
