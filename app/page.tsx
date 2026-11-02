import { auth } from "@clerk/nextjs/server";
import DashboardClient from "@/components/DashboardClient";

export default async function Page() {
  await auth.protect();

  return <DashboardClient />;
}
