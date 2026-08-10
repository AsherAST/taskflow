import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import ResetCodeForm from "@/components/ResetCodeForm";

export default async function ResetPasswordCodePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const user = await getSessionUser();
  if (user) redirect("/boards");

  const { email } = await searchParams;

  return <ResetCodeForm email={email ?? ""} />;
}
