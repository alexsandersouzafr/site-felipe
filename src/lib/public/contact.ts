import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(254),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export function parseContactMessage(input: unknown) {
  return contactMessageSchema.safeParse(input);
}
