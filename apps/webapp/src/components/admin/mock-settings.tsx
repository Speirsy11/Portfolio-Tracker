"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export function MockSettings() {
  const [llmMockEnabled, setLlmMockEnabled] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    ...trpc.admin.getMockSettings.queryOptions(),
  });

  const setLlmMock = useMutation({
    ...trpc.admin.setLlmMock.mutationOptions(),
    onSuccess: async (data) => {
      setLlmMockEnabled(data.llmMockEnabled);
      await queryClient.invalidateQueries({
        queryKey: trpc.admin.getMockSettings.queryKey(),
      });
      toast.success(
        data.llmMockEnabled ? "LLM mocking enabled" : "LLM mocking disabled",
      );
    },
    onError: (error) => {
      toast.error(`Failed to update setting: ${error.message}`);
    },
  });

  useEffect(() => {
    if (settings) {
      setLlmMockEnabled(settings.llmMockEnabled);
    }
  }, [settings]);

  const handleToggle = (checked: boolean) => {
    setLlmMockEnabled(checked);
    setLlmMock.mutate({ enabled: checked });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mock Settings</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mock Settings</CardTitle>
        <CardDescription>
          Configure mocking for external services to reduce API costs during
          development and testing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="llm-mock" className="text-base font-medium">
              LLM Mocking
            </Label>
            <p className="text-sm text-muted-foreground">
              When enabled, the sentiment analysis will return mock responses
              instead of calling the OpenAI API.
            </p>
          </div>
          <Switch
            id="llm-mock"
            checked={llmMockEnabled}
            onCheckedChange={handleToggle}
            disabled={setLlmMock.isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}
