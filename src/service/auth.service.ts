import http from "@/service/http";
import {User} from "@/type/User";

export const AuthService = {
   me() :Promise<User>{
       return http("/auth/me").then((res) => res.data);
   }
}