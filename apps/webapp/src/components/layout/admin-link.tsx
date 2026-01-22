"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Settings } from "lucide-react";

import { Button } from "@portfolio/ui/button";

import { useTRPC } from "~/trpc/react";

export function AdminLink() {
  const trpc = useTRPC();
  const { data } = useQuery({
    ...trpc.admin.isAdmin.queryOptions(),
  });

  if (!data?.isAdmin) {
    return null;
  }

  return (
    <Link href="/admin">
      <Button variant="outline" size="sm" className="hidden md:flex">
        <Settings className="mr-2 h-4 w-4" />
        Admin
      </Button>
    </Link>
  );
}
