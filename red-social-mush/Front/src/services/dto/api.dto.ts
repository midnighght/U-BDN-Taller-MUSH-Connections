export type loginDTO = {
    email: String;
    password: string;
}

export type loginResponseDTO = {
    message?: String;
    access_token: String;
    user : {
        id: String;
        username:String;
        email:String;
    }
}

export type registerDTO = {
    username: string; 
    email: string;
    password: string;
    description?: string;
    isPrivate?: boolean;
}

export type signInDTO =     {
    userId: string;
    username: string;
    email: string
}