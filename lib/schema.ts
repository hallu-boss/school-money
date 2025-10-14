import z from "zod";

const schema = z.object({
  email: z.email(),
  password: z.string().min(6).max(100),
});

export { schema };