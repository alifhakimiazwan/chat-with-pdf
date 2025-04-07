"use client";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
const DashboardButton = ({ userId }) => {
  const router = useRouter();
  return (
    <Button
      size={"lg"}
      className="mb-4"
      onClick={() => {
        router.push(`/dashboard`);
      }}
    >
      Go to dashboard <ArrowRight className="mx-0" />
    </Button>
  );
};
export default DashboardButton;
