import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { SettingsContent } from "~/components/settings/settings-content";

export const metadata = {
  title: "Settings | Portfolio Tracker",
  description: "Manage your account settings and preferences",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session.userId) {
    redirect("/");
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      <SettingsContent />
    </div>
  );
}
