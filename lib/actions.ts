import { schema } from '@/lib/schema';
import db from '@/lib/db';
import { executeAction } from '@/lib/executeAction';
import argon2 from 'argon2';

const signUp = async (formData: FormData) => {
  return executeAction({
    actionFn: async () => {
      const email = formData.get('email');
      const password = formData.get('password');

      const validatedData = schema.parse({ email, password });

      const hashed = await argon2.hash(validatedData.password);

      await db.user.create({
        data: {
          email: validatedData.email.toLocaleLowerCase(),
          password: hashed,
        },
      });
    },
    successMessage: 'Signed up successfully',
  });
};

export { signUp };
