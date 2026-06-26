import { z } from "zod";
import { MessageType } from "@prisma/client";

export const CreateMessageSchema = z.object({
  content: z.string().min(1, "Message content cannot be empty"),
  type: z.nativeEnum(MessageType).default(MessageType.TEXT),
  documentUrl: z.string().url("Invalid document attachment URL").optional().nullable(),
});

export type CreateMessageDTO = z.infer<typeof CreateMessageSchema>;
