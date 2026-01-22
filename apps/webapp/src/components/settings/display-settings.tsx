"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DollarSign, Loader2, Moon, Palette, Sun } from "lucide-react";

import { Button } from "@portfolio/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@portfolio/ui/card";
import { Label } from "@portfolio/ui/label";
import { toast } from "@portfolio/ui/toast";

import { useTRPC } from "~/trpc/react";

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "\u20AC" },
  { code: "GBP", name: "British Pound", symbol: "\u00A3" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "JPY", name: "Japanese Yen", symbol: "\u00A5" },
];

export function DisplaySettings() {
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

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    updateMutation.mutate({ theme });
    // Also update the actual theme
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // System preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const handleCurrencyChange = (currency: string) => {
    updateMutation.mutate({ currency });
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
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Display</CardTitle>
            <CardDescription>
              Customize how the app looks and displays data
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Selection */}
        <div className="space-y-3">
          <Label className="text-base">Theme</Label>
          <p className="text-sm text-muted-foreground">
            Choose your preferred color scheme
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={preferences?.theme === "light" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleThemeChange("light")}
              disabled={updateMutation.isPending}
              className="gap-2"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={preferences?.theme === "dark" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleThemeChange("dark")}
              disabled={updateMutation.isPending}
              className="gap-2"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
            <Button
              variant={preferences?.theme === "system" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleThemeChange("system")}
              disabled={updateMutation.isPending}
            >
              System
            </Button>
          </div>
        </div>

        {/* Currency Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <Label className="text-base">Currency</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Select your preferred display currency
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {currencies.map((currency) => (
              <Button
                key={currency.code}
                variant={
                  preferences?.currency === currency.code
                    ? "primary"
                    : "outline"
                }
                size="sm"
                onClick={() => handleCurrencyChange(currency.code)}
                disabled={updateMutation.isPending}
                className="justify-start"
              >
                <span className="mr-2 font-mono">{currency.symbol}</span>
                {currency.code}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
