"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  BellOff,
  CheckCircle,
  Loader2,
  Trash2,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@portfolio/ui/alert-dialog";
import { Button } from "@portfolio/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@portfolio/ui/card";
import { toast } from "@portfolio/ui/toast";

import { useTRPC } from "~/trpc/react";

interface Alert {
  id: string;
  assetId: string;
  targetPrice: string;
  condition: string;
  isActive: boolean;
  triggeredAt: Date | null;
  createdAt: Date;
  asset: {
    id: string;
    symbol: string;
    name: string;
  };
}

interface AlertsListProps {
  initialAlerts: Alert[];
}

export function AlertsList({ initialAlerts }: AlertsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState<Alert | null>(null);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: alerts } = useQuery({
    ...trpc.alerts.list.queryOptions(),
    initialData: initialAlerts,
  });

  const deleteMutation = useMutation({
    ...trpc.alerts.delete.mutationOptions(),
    onSuccess: async () => {
      toast.success("Alert deleted successfully");
      await queryClient.invalidateQueries({
        queryKey: trpc.alerts.list.queryKey(),
      });
    },
    onError: (error) => {
      toast.error("Failed to delete alert", {
        description: error.message,
      });
    },
  });

  const toggleMutation = useMutation({
    ...trpc.alerts.toggle.mutationOptions(),
    onSuccess: async (result) => {
      toast.success(result.isActive ? "Alert activated" : "Alert paused");
      await queryClient.invalidateQueries({
        queryKey: trpc.alerts.list.queryKey(),
      });
    },
    onError: (error) => {
      toast.error("Failed to toggle alert", {
        description: error.message,
      });
    },
  });

  const handleDeleteClick = (alert: Alert) => {
    setAlertToDelete(alert);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!alertToDelete) return;
    deleteMutation.mutate({ alertId: alertToDelete.id });
    setDeleteDialogOpen(false);
    setAlertToDelete(null);
  };

  const handleToggle = (alertId: string) => {
    toggleMutation.mutate({ alertId });
  };

  const isDeleting = deleteMutation.isPending;
  const isToggling = toggleMutation.isPending;

  const activeAlerts = alerts.filter((a) => a.isActive && !a.triggeredAt);
  const triggeredAlerts = alerts.filter((a) => a.triggeredAt);
  const pausedAlerts = alerts.filter((a) => !a.isActive && !a.triggeredAt);

  const renderAlertCard = (alert: Alert) => {
    const isAbove = alert.condition === "above";
    const isTriggered = !!alert.triggeredAt;

    return (
      <div
        key={alert.id}
        className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
          isTriggered
            ? "border-green-500/50 bg-green-500/5"
            : alert.isActive
              ? "border-border hover:bg-muted/50"
              : "border-border/50 bg-muted/30 opacity-60"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              isTriggered
                ? "bg-green-500/10"
                : isAbove
                  ? "bg-emerald-500/10"
                  : "bg-red-500/10"
            }`}
          >
            {isTriggered ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : isAbove ? (
              <ArrowUp className="h-5 w-5 text-emerald-500" />
            ) : (
              <ArrowDown className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{alert.asset.symbol}</span>
              <span className="text-sm text-muted-foreground">
                {alert.asset.name}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {isAbove ? "Above" : "Below"} $
              {Number(alert.targetPrice).toLocaleString()}
              {isTriggered && alert.triggeredAt && (
                <span className="ml-2 text-green-500">
                  Triggered {new Date(alert.triggeredAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isTriggered && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggle(alert.id)}
              disabled={isToggling}
              title={alert.isActive ? "Pause alert" : "Activate alert"}
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : alert.isActive ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClick(alert)}
            disabled={isDeleting && alertToDelete?.id === alert.id}
            className="text-destructive hover:text-destructive"
          >
            {isDeleting && alertToDelete?.id === alert.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Your Alerts</CardTitle>
              <CardDescription>
                {alerts.length} alert{alerts.length !== 1 ? "s" : ""} configured
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {alerts.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No alerts yet. Create one to get started.
            </div>
          ) : (
            <>
              {activeAlerts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Active ({activeAlerts.length})
                  </h3>
                  <div className="space-y-2">
                    {activeAlerts.map(renderAlertCard)}
                  </div>
                </div>
              )}

              {triggeredAlerts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Triggered ({triggeredAlerts.length})
                  </h3>
                  <div className="space-y-2">
                    {triggeredAlerts.map(renderAlertCard)}
                  </div>
                </div>
              )}

              {pausedAlerts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Paused ({pausedAlerts.length})
                  </h3>
                  <div className="space-y-2">
                    {pausedAlerts.map(renderAlertCard)}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Alert</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the alert for{" "}
              {alertToDelete?.asset.symbol}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
