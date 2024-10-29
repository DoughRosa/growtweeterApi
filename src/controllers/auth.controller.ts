import { Request, Response } from "express";
import db from "../database/prisma.connection";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import * as jwt from "jsonwebtoken";

class AuthController {
  public async store(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "Please fill the requires fields." });
    }

    try {
      const findUser = await db.users.findUnique({
        where: { email },
      });

      if (!findUser || !bcrypt.compareSync(password, findUser.password || "")) {
        return res
          .status(401)
          .json({ success: false, msg: "Invalid Email or Password" });
      }

      const token = jwt.sign(
        { user: findUser.email, id: findUser.id },
        process.env.JWT_SECRET || "",
        { expiresIn: "1d" }
      );

      res
        .status(200)
        .json({
          success: true,
          msg: "Logged Successfully",
          data: { token },
          id: findUser.id,
        });

        return
        
    } catch (error) {
      return res.status(500).json({ success: false, msg: "ERROR Database." });
    }
  }
}

export default AuthController;
