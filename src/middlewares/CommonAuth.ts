import { Request, Response, NextFunction } from "express"

import { AuthPayload } from "../dto/Auth.dot"
import { ValidateSignature } from "../utility"


declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload
        }
    }
}


export const Authenticate = async (req: Request, res: Response, next: NextFunction) => {

    const validate = await ValidateSignature(req);
    console.log("CommonAuth req: ", req.get('Authorization'))

    if(validate) {
        next()
    } else{
        return res.json({"message": "user not Authenticated"})
    }

}