import { StringExpressionOperatorReturningBoolean } from "mongoose";

export class loginDTO {
    email: String;
    password: string;
}

export class loginResponseDTO {
    message?: String;
    access_token: String;
    user : {
        id: String;
        username:String;
        email:String;
    }
}

export class registerDTO {
    username: string; 
    email: string;
    password: string;
    description?: string;
    isPrivate?: boolean;
}

export class signInDTO {
    userId: string;
    username: string;
    email: string
}

