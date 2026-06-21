import http from "@/service/http";
import {MeResponse} from "@/type/Auth";

export const AuthService = {
   me() :Promise<MeResponse>{
       return http("/auth/me").then((res) => res.data);
   }
}