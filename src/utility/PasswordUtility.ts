import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { APP_SECRET } from "../config";
import { Request } from "express";
import { AuthPayload } from "../dto/Auth.dot";


export const GenerateSalt = async () => {
    return await bcrypt.genSalt()
}

export const GeneratePassword = async ( password: string, salt: string) => {
    return bcrypt.hash(password, salt)
}

export const ValidatePassword = async (enteredPassword: string, savedPassword: string, salt: string) => {    
    return await GeneratePassword(enteredPassword, salt) === savedPassword;
}


export const GenerateSignature = (payload: AuthPayload) => { 
    return jwt.sign(payload, APP_SECRET, { expiresIn: '1d'} )
}


export const ValidateSignature = async (req: Request) => {

    const signature = req.get('Authorization');

    if(signature) {

        const payload = await jwt.verify(signature.split(' ')[1], APP_SECRET) as AuthPayload;
        
        req.user = payload;
        console.log("req.user", req.user)

        return true;

    }

    return false
}