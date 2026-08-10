import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const user = await getSessionUser();
  if (user) redirect("/boards");

  const { token } = await params;
  return <ResetPasswordForm token={token} />;
}
