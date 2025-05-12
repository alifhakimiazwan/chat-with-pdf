import Sidebar from "@/components/Sidebar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <div className="block lg:hidden fixed top-0 left-0 z-50">
        <Sidebar isMobile />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-12 px-4 sm:pt-0 sm:px-0">
        {children}
      </div>
    </div>
  );
}
