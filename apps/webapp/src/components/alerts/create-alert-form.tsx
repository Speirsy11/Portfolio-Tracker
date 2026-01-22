"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2, Plus } from "lucide-react";

import { Button } from "@portfolio/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@portfolio/ui/card";
import { Input } from "@portfolio/ui/input";
import { Label } from "@portfolio/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@portfolio/ui/select";
import { toast } from "@portfolio/ui/toast";

import { TickerAutocomplete } from "~/components/shared/ticker-autocomplete";
import { useTRPC } from "~/trpc/react";

export function CreateAlertForm() {
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [isCreating, setIsCreating] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    ...trpc.alerts.create.mutationOptions(),
    onSuccess: async () => {
      setSymbol("");
      setName("");
      setTargetPrice("");
      setCondition("above");
      toast.success("Alert created successfully");
      await queryClient.invalidateQueries({
        queryKey: trpc.alerts.list.queryKey(),
      });
    },
    onError: (error) => {
      toast.error("Failed to create alert", {
        description: error.message,
      });
    },
    onSettled: () => setIsCreating(false),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!symbol.trim() || !targetPrice.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsCreating(true);
    createMutation.mutate({
      symbol: symbol.trim().toUpperCase(),
      name: name.trim() || symbol.trim().toUpperCase(),
      targetPrice: price,
      condition,
    });
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Create Alert</CardTitle>
            <CardDescription>Set a price target for any asset</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Asset *</Label>
            <TickerAutocomplete
              value={symbol}
              selectedName={name}
              onSelect={(ticker) => {
                setSymbol(ticker.symbol);
                setName(ticker.name);
              }}
              placeholder="Search for a ticker..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetPrice">Target Price *</Label>
            <Input
              id="targetPrice"
              type="number"
              step="any"
              min="0"
              placeholder="e.g., 50000"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select
              value={condition}
              onValueChange={(value: "above" | "below") => setCondition(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Price goes above</SelectItem>
                <SelectItem value="below">Price goes below</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Create Alert
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
