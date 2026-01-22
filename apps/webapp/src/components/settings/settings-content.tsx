"use client";

import { AccountSettings } from "./account-settings";
import { DisplaySettings } from "./display-settings";
import { NotificationSettings } from "./notification-settings";

export function SettingsContent() {
  return (
    <div className="space-y-8">
      <NotificationSettings />
      <DisplaySettings />
      <AccountSettings />
    </div>
  );
}
