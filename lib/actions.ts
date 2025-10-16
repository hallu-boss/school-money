import { schema } from '@/lib/schema';
import db from '@/lib/db';
import { executeAction } from '@/lib/executeAction';
import path from 'path';
import { mkdir } from 'fs/promises';

const signUp = async (formData: FormData) => {
  return executeAction({
    actionFn: async () => {
      const email = formData.get('email');
      const password = formData.get('password');
      const validatedData = schema.parse({ email, password });

      const user = await db.user.create({
        data: { email: validatedData.email.toLowerCase(), password: validatedData.password },
      });

      const userDir = path.join(process.cwd(), 'public', 'uploads', 'users', user.id);
      await mkdir(userDir, { recursive: true });

      await db.user.update({
        where: { id: user.id },
        data: { image: `/uploads/users/${user.id}/avatar.jpg` },
      });
    },
    successMessage: 'Signed up successfully',
  });
};

export { signUp };
