"use client";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
const DashboardButton = () => {
  const router = useRouter();
  return (
    <Button
      size={"lg"}
      className="mb-2 bg-purple-600 text-white hover:bg-purple-700 font-semibold"
      onClick={() => {
        router.push(`/dashboard/chat`);
      }}
    >
      Go to dashboard <ArrowRight className="mx-0" />
    </Button>
  );
};
export default DashboardButton;
