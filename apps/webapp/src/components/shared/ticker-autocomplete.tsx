"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bitcoin,
  Bookmark,
  CircleDollarSign,
  LineChart,
  TrendingUp,
} from "lucide-react";

import type { ComboboxOption } from "@portfolio/ui/combobox";
import { Combobox } from "@portfolio/ui/combobox";

import { useDebounce } from "~/hooks/use-debounce";
import { useTRPC } from "~/trpc/react";

interface TickerAutocompleteProps {
  value?: string;
  selectedName?: string;
  onSelect: (ticker: { symbol: string; name: string }) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function getTypeIcon(type: string, isLocal: boolean) {
  if (isLocal) {
    return <Bookmark className="h-4 w-4 text-primary" />;
  }

  switch (type) {
    case "CRYPTOCURRENCY":
      return <Bitcoin className="h-4 w-4 text-orange-500" />;
    case "ETF":
      return <TrendingUp className="h-4 w-4 text-blue-500" />;
    case "CURRENCY":
      return <CircleDollarSign className="h-4 w-4 text-green-500" />;
    default:
      return <LineChart className="h-4 w-4 text-muted-foreground" />;
  }
}

export function TickerAutocomplete({
  value,
  selectedName,
  onSelect,
  placeholder = "Search for a ticker...",
  disabled = false,
  className,
}: TickerAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  const trpc = useTRPC();

  const { data: results, isLoading } = useQuery({
    ...trpc.tickers.search.queryOptions({
      query: debouncedQuery,
      limit: 10,
    }),
    enabled: debouncedQuery.length >= 1,
  });

  // Build display label for the selected value
  const displayLabel = value
    ? selectedName
      ? `${value} - ${selectedName}`
      : value
    : undefined;

  const options: ComboboxOption[] =
    results?.map((ticker) => ({
      value: ticker.symbol,
      label: ticker.symbol,
      description: ticker.name,
      icon: getTypeIcon(ticker.type, ticker.isLocal),
    })) ?? [];

  // Add current value to options if it's not in results
  if (value && displayLabel && !options.find((o) => o.value === value)) {
    options.unshift({
      value: value,
      label: displayLabel,
    });
  }

  const handleValueChange = (selectedValue: string) => {
    const selectedTicker = results?.find((t) => t.symbol === selectedValue);
    if (selectedTicker) {
      onSelect({
        symbol: selectedTicker.symbol,
        name: selectedTicker.name,
      });
    }
  };

  return (
    <Combobox
      options={options}
      value={value}
      displayValue={displayLabel}
      onValueChange={handleValueChange}
      onInputChange={setSearchQuery}
      placeholder={placeholder}
      emptyMessage={
        searchQuery.length > 0
          ? "No tickers found."
          : "Type to search for tickers..."
      }
      isLoading={isLoading && debouncedQuery.length >= 1}
      disabled={disabled}
      className={className}
    />
  );
}
