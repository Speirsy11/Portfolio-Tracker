"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, Trash2, User } from "lucide-react";

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

export function AccountSettings() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { signOut } = useClerk();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: accountInfo, isLoading } = useQuery({
    ...trpc.settings.getAccountInfo.queryOptions(),
  });

  const exportMutation = useMutation({
    ...trpc.settings.exportData.mutationOptions(),
    onSuccess: (data) => {
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `portfolio-tracker-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    },
    onError: (error) => {
      toast.error("Failed to export data", {
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    ...trpc.settings.deleteAccountData.mutationOptions(),
    onSuccess: async () => {
      toast.success("Account data deleted");
      void queryClient.invalidateQueries();
      // Sign out and redirect
      await signOut({ redirectUrl: "/" });
    },
    onError: (error) => {
      toast.error("Failed to delete account data", {
        description: error.message,
      });
    },
  });

  const handleExport = () => {
    exportMutation.mutate();
  };

  const handleDelete = () => {
    deleteMutation.mutate();
    setShowDeleteDialog(false);
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Account</CardTitle>
              <CardDescription>Manage your account and data</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Info */}
          {accountInfo && (
            <div className="rounded-lg border border-border p-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{accountInfo.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Portfolios</p>
                  <p className="font-medium">{accountInfo.portfolioCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Assets</p>
                  <p className="font-medium">{accountInfo.totalAssets}</p>
                </div>
              </div>
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">
                  Member since{" "}
                  {new Date(accountInfo.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {/* Export Data */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium">Export Your Data</p>
              <p className="text-sm text-muted-foreground">
                Download all your portfolio data as JSON
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export
            </Button>
          </div>

          {/* Delete Account */}
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div>
              <p className="font-medium text-destructive">
                Delete Account Data
              </p>
              <p className="text-sm text-muted-foreground">
                Remove all your data from our servers. This action cannot be
                undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your portfolios, preferences, and
              associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
