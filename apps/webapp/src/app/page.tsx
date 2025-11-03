import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { AuthShowcase } from "./t3-starter/auth-showcase";
import {
  CreatePostForm,
  PostCardSkeleton,
  PostList,
} from "./t3-starter/posts";

export default function Home() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center p-4">
      <h1 className="mb-8 text-4xl font-bold">Welcome to Exchange Simulator!</h1>
    </div>
  );
}
