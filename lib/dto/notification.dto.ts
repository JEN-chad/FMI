import { z } from "zod";

export const CreateNotificationSchema = z.object({
  userId: z.string().uuid("Invalid target user ID"),
  type: z.string().min(1, "Notification type is required"),
  title: z.string().min(1, "Notification title is required"),
  body: z.string().optional().nullable(),
  data: z.record(z.any()).optional().nullable(),
});

export type CreateNotificationDTO = z.infer<typeof CreateNotificationSchema>;
