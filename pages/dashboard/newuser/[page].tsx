import NewUserInitiation from "@/components/AuthComponents/NewUserInitiation/NewUserInitiation";
import { useRouter } from "next/router";
import React from "react";
export default function Page() {
  const router = useRouter();
  const { page } = router.query;
  return <NewUserInitiation page={page} />;
}
