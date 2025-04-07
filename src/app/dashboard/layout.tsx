import Sidebar from "@/components/Sidebar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers"; // ✅ Get request headers for pathname check

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex max-h-screen overflow-hidden">
      <div className="flex-[1] max-w-xs">
        <Sidebar userId={userId} />
      </div>

      <div className="flex-[5] overflow-auto">{children}</div>
    </div>
  );
}
