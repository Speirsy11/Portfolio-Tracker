import Link from "next/link";

interface AssetLinkProps {
  symbol: string;
  children?: React.ReactNode;
  className?: string;
}

export function AssetLink({ symbol, children, className }: AssetLinkProps) {
  return (
    <Link
      href={`/assets/${symbol}`}
      className={
        className ??
        "font-medium text-foreground transition-colors hover:text-primary hover:underline"
      }
    >
      {children ?? symbol}
    </Link>
  );
}
