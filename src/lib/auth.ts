
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prisma";
import { getUserRole } from "./roles";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            authorization: {
                params: {
                    prompt: "select_account"
                }
            }
        }),
        CredentialsProvider({
            name: "Passcode",
            credentials: {
                passcode: { label: "Passcode", type: "password" }
            },
            async authorize(credentials) {
                if (credentials?.passcode === "8888") {
                    // Return a mock user for the viewer
                    return {
                        id: "viewer-guest",
                        name: "Guest Admin",
                        email: "guest@example.com",
                        role: "viewer" as const,
                        image: null
                    };
                }
                return null;
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                if (token.sub) {
                    session.user.id = token.sub;
                }
                session.user.role = token.role || (await getUserRole(session.user.email));
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
                token.role = user.role;
            }
            return token;
        }
    },
};
