import z from 'zod';

const schema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Minimum 6 characters').max(100),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Minimum 2 characters').max(100),
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters').max(100),
});

export type RegisterData = z.infer<typeof registerSchema>;

export type LoginData = z.infer<typeof schema>;

export { schema, registerSchema };
