import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";

async function authMiddleware(req: Request, res: Response, next: NextFunction){
    
    const authHeader = req.headers.authorization;

    if (authHeader) {
        let decoded;
    
        try {
          decoded = jwt.verify(authHeader, process.env.JWT_SECRET || "");
        } catch (error) {
          return res.status(401).json({msg: "Token inválido"});
        }
    
        return next();
      }
    
      return res.status(401).json({success: false, msg: "user not logged."});
    }

export default authMiddleware;