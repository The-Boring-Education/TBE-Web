import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import { envConfig, routes } from '@tbe/constants';
import { createUserInDB, getUserByEmailFromDB } from '@tbe/database';
import { connectDB } from '@/middleware/api';

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: envConfig.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: envConfig.GOOGLE_AUTH_CLIENT_SECRET,
    }),
  ],
  secret: envConfig.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }: any) {
      if (!user) return false;

      const { name, email } = user;

      if (!email || !name) return false;

      try {
        await connectDB();

        // Find or create the user in MongoDB
        const { data: existingUser } = await getUserByEmailFromDB(email);

        if (!existingUser) {
          // Create a new user in MongoDB if not found

          const { data: result } = await createUserInDB({
            name,
            email,
            image: user.image,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          });

          // Attach the MongoDB _id to the user object
          user.id = result._id.toString();
        } else {
          // If the user exists, attach the MongoDB _id to the user object
          user.id = existingUser._id.toString();
        }

        return true; // Allow the sign in
      } catch (error) {
        console.error('Error signing in:', error);
        return false;
      }
    },

    async session({ session, token }: any) {
      // Attach the MongoDB user ID to the session object
      session.user.id = token.sub; // `sub` was set in the jwt callback

      const { data: existingUser } = await getUserByEmailFromDB(
        session.user.email
      );
      if (existingUser) {
        session.user.isOnboarded = existingUser.isOnboarded;

        return session;
      }
    },

    async jwt({ token, user }: any) {
      if (user) {
        // Attach the MongoDB user ID to the token (if this is the initial sign in)
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: routes?.register,
  },
};

export default NextAuth(authOptions);
export { authOptions };
