import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import connectDB from "@/config/db.config";
import User from "@/models/userModel";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account }) {
      await connectDB();
      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        await User.create({
          name: user.name,
          email: user.email,
          avatar: user.image,
          isVerified: true,
          provider: account.provider,
        });
      } else {
        existingUser.name = user.name || existingUser.name;
        existingUser.isVerified = true;

        if (user.image) {
          existingUser.avatar = user.image;
        }

        if (account?.provider) {
          existingUser.provider = account.provider;
        }

        await existingUser.save();
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session }) {
      await connectDB();
      const dbUser = await User.findOne({ email: session.user.email });

      if (dbUser) {
        session.user.id = dbUser._id.toString();
        session.user.isVerified = dbUser.isVerified;
        session.user.image = dbUser.avatar || session.user.image;
        session.user.avatar = dbUser.avatar || session.user.image || "";
        session.user.role = dbUser.role;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
