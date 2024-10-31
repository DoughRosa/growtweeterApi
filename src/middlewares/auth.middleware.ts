import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";

async function authMiddleware(req: Request, res: Response, next: NextFunction){

    const { authorization } = req.headers;
    const token = authorization?.split(" ")[1];
    

    if (token) {
        let decoded;
    
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET || "");
        } catch (error) {
          return res.status(401).json({msg: "Token inválido"});
        }
    
        return next();
      }
    
      return res.status(401).json({success: false, msg: "user not logged."});
    }

    return next();
  }

  return res.status(401).json({ success: false, msg: "user not logged." });
}

export default authMiddleware;
