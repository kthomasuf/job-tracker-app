import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  trustHost: true,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile?.email) {
        const user = await prisma.user.upsert({
          where: { email: profile.email },
          update: { name: profile.name, image: profile.picture },
          create: { email: profile.email, name: profile.name, image: profile.picture },
        });
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.userId === "string") {
        session.user.id = token.userId;
      }
      return session;
    },
  },
});
