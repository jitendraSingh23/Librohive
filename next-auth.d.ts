import   { type DefaultSession } from "next-auth";
import { UserRole } from "@prisma/client";
// export type ExtendedUser = DefaultSession["user"] & {
//   role: UserRole;
// };
// declare module "next-auth" {
//   interface session {
//     user: ExtendedUser;
//   }
// }


declare module "next-auth" {
  
  interface Session {
    user: {
      id:string,
      role: UserRole
      isTwoFactorEnabled: boolean
      isOAuth :boolean
      bio?: string
    } & DefaultSession["user"]
  }
}