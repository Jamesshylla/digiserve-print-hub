import { z } from "zod";

export const designOrderSchema = z.object({
  orderCode: z.string().trim().min(4).max(32),
  customerName: z.string().trim().min(2, "Please enter your name").max(100),
  customerPhone: z
    .string()
    .trim()
    .min(6, "Please enter a valid phone number")
    .max(20)
    .regex(/^[0-9+\-\s]+$/, "Phone number may only contain digits"),
  notes: z.string().trim().max(500).optional().default(""),
  garmentSlug: z.string().trim().min(1).max(80),
  garmentName: z.string().trim().min(1).max(120),
  garmentColor: z.string().trim().max(20),
  size: z.string().trim().max(6),
  quantity: z.number().int().min(1).max(2000),
  design: z.unknown(),
  frontPreviewPath: z.string().trim().max(300).nullable().optional(),
  backPreviewPath: z.string().trim().max(300).nullable().optional(),
  amount: z.number().min(0).max(10_000_000),
  couponCode: z.string().trim().max(40).nullable().optional(),
});

export type DesignOrderInput = z.infer<typeof designOrderSchema>;
