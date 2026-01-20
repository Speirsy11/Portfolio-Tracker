import { z } from "zod/v4";

export const NewsItemSchema = z
  .object({
    uuid: z.string(),
    title: z.string(),
    link: z.string(),
    // library might return date or number
    providerPublishTime: z.number().or(z.date()).optional(),
    thumbnail: z
      .object({
        resolutions: z
          .array(
            z.object({
              url: z.string(),
            }),
          )
          .optional(),
      })
      .optional()
      .nullish(),
    publisher: z.string().optional(),
  })
  .passthrough();

export const SearchResponseSchema = z.object({
  news: z.array(NewsItemSchema),
});

export type NewsItem = z.infer<typeof NewsItemSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
