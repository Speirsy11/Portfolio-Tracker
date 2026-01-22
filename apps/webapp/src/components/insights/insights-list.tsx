"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Brain, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";

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

export function InsightsList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: insights, isLoading } = useQuery({
    ...trpc.insights.getAllInsights.queryOptions({ limit: 10, type: "all" }),
  });

  const feedbackMutation = useMutation({
    ...trpc.insights.submitFeedback.mutationOptions(),
    onSuccess: () => {
      toast.success("Thanks for your feedback!");
      void queryClient.invalidateQueries({
        queryKey: trpc.insights.getAllInsights.queryKey({
          limit: 10,
          type: "all",
        }),
      });
    },
    onError: (error) => {
      toast.error("Failed to submit feedback", {
        description: error.message,
      });
    },
  });

  const handleFeedback = (insightId: string, isHelpful: boolean) => {
    feedbackMutation.mutate({ insightId, isHelpful });
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="flex h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">AI Insights Archive</CardTitle>
            <CardDescription>
              Historical market analysis and recommendations
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {insights && insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          insight.type === "market_summary"
                            ? "bg-blue-500/10 text-blue-500"
                            : insight.type === "recommendation"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-purple-500/10 text-purple-500"
                        }`}
                      >
                        {insight.type === "market_summary"
                          ? "Market Summary"
                          : insight.type === "recommendation"
                            ? "Recommendation"
                            : "Portfolio Analysis"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(insight.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-medium">{insight.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {insight.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(insight.id, true)}
                      disabled={feedbackMutation.isPending}
                      className="text-muted-foreground hover:text-green-500"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="ml-1 text-xs">
                        {insight.helpfulVotes}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(insight.id, false)}
                      disabled={feedbackMutation.isPending}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="ml-1 text-xs">
                        {insight.notHelpfulVotes}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <Brain className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p className="text-lg font-medium">No insights yet</p>
            <p className="text-sm">
              AI insights will appear here as market data is analyzed
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
