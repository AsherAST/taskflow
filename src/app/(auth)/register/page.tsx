import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import AuthForm from "@/components/AuthForm";

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) redirect("/boards");

  return <AuthForm mode="register" />;
}
