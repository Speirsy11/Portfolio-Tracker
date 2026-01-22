"use client";

import { AlertsList } from "./alerts-list";
import { CreateAlertForm } from "./create-alert-form";

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

interface AlertsContentProps {
  initialAlerts: Alert[];
}

export function AlertsContent({ initialAlerts }: AlertsContentProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <CreateAlertForm />
      </div>
      <div className="lg:col-span-2">
        <AlertsList initialAlerts={initialAlerts} />
      </div>
    </div>
  );
}
