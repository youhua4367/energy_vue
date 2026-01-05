import type {LoginForm} from "@/types/login.ts";
import type {ApiResponse} from "@/types/api.ts";
import request from "@/utils/request.ts";

export const login = (login: LoginForm): Promise<ApiResponse> => {
    return request.post("/user/user/login", login);
}