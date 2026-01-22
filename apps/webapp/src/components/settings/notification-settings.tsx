"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2, Mail } from "lucide-react";

import { Button } from "@portfolio/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@portfolio/ui/card";
import { Label } from "@portfolio/ui/label";
import { Switch } from "@portfolio/ui/switch";
import { toast } from "@portfolio/ui/toast";

import { useTRPC } from "~/trpc/react";

export function NotificationSettings() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    ...trpc.settings.getPreferences.queryOptions(),
  });

  const updateMutation = useMutation({
    ...trpc.settings.updatePreferences.mutationOptions(),
    onSuccess: () => {
      toast.success("Preferences updated");
      void queryClient.invalidateQueries({
        queryKey: trpc.settings.getPreferences.queryKey(),
      });
    },
    onError: (error) => {
      toast.error("Failed to update preferences", {
        description: error.message,
      });
    },
  });

  const handleToggle = (
    key: "emailNotifications" | "pushNotifications",
    value: boolean,
  ) => {
    updateMutation.mutate({ [key]: value });
  };

  const handleFrequencyChange = (
    frequency: "instant" | "hourly" | "daily" | "weekly",
  ) => {
    updateMutation.mutate({ notificationFrequency: frequency });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Notifications</CardTitle>
            <CardDescription>
              Configure how you want to be notified
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="email-notifications" className="text-base">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive updates via email
              </p>
            </div>
          </div>
          <Switch
            id="email-notifications"
            checked={preferences?.emailNotifications ?? true}
            onCheckedChange={(checked) =>
              handleToggle("emailNotifications", checked)
            }
            disabled={updateMutation.isPending}
          />
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="push-notifications" className="text-base">
                Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive browser push notifications
              </p>
            </div>
          </div>
          <Switch
            id="push-notifications"
            checked={preferences?.pushNotifications ?? false}
            onCheckedChange={(checked) =>
              handleToggle("pushNotifications", checked)
            }
            disabled={updateMutation.isPending}
          />
        </div>

        {/* Notification Frequency */}
        <div className="space-y-3">
          <Label className="text-base">Notification Frequency</Label>
          <p className="text-sm text-muted-foreground">
            How often should we send you updates?
          </p>
          <div className="flex flex-wrap gap-2">
            {(["instant", "hourly", "daily", "weekly"] as const).map((freq) => (
              <Button
                key={freq}
                variant={
                  preferences?.notificationFrequency === freq
                    ? "primary"
                    : "outline"
                }
                size="sm"
                onClick={() => handleFrequencyChange(freq)}
                disabled={updateMutation.isPending}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
