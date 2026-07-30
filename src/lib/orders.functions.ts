import { createServerFn } from "@tanstack/react-start";
import { designOrderSchema } from "./orders.schema";
import { insertDesignOrder } from "./orders.server";

export const submitDesignOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => designOrderSchema.parse(input))
  .handler(async ({ data }) => insertDesignOrder(data));
