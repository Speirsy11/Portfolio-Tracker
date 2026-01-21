"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Plus, Trash2 } from "lucide-react";

import { Button } from "@portfolio/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@portfolio/ui/card";
import { Input } from "@portfolio/ui/input";

import { useTRPC } from "~/trpc/react";

interface Portfolio {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PortfolioListProps {
  initialPortfolios: Portfolio[];
  onSelectPortfolio: (portfolioId: string) => void;
  selectedPortfolioId: string | null;
}

export function PortfolioList({
  initialPortfolios,
  onSelectPortfolio,
  selectedPortfolioId,
}: PortfolioListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: portfolios } = useQuery({
    ...trpc.portfolio.list.queryOptions(),
    initialData: initialPortfolios,
  });

  const createMutation = useMutation({
    ...trpc.portfolio.create.mutationOptions(),
    onSuccess: async () => {
      setNewPortfolioName("");
      setShowCreateForm(false);
      await queryClient.invalidateQueries({
        queryKey: trpc.portfolio.list.queryKey(),
      });
    },
    onSettled: () => setIsCreating(false),
  });

  const deleteMutation = useMutation({
    ...trpc.portfolio.delete.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: trpc.portfolio.list.queryKey(),
      });
    },
  });

  const handleCreate = () => {
    if (!newPortfolioName.trim()) return;
    setIsCreating(true);
    createMutation.mutate({ name: newPortfolioName.trim() });
  };

  const handleDelete = (portfolioId: string) => {
    if (confirm("Are you sure you want to delete this portfolio?")) {
      deleteMutation.mutate({ portfolioId });
      if (selectedPortfolioId === portfolioId) {
        onSelectPortfolio("");
      }
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Your Portfolios</CardTitle>
              <CardDescription>
                Select a portfolio to view sentiment data
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus className="mr-1 h-4 w-4" />
            New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showCreateForm && (
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Portfolio name"
              value={newPortfolioName}
              onChange={(e) => setNewPortfolioName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </div>
        )}

        {portfolios.length > 0 ? (
          <div className="space-y-2">
            {portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted ${
                  selectedPortfolioId === portfolio.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
                onClick={() => onSelectPortfolio(portfolio.id)}
              >
                <div>
                  <div className="font-medium">{portfolio.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Created {new Date(portfolio.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(portfolio.id);
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No portfolios yet. Create one to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
