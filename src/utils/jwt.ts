import jwt from "jsonwebtoken";
import { serverConfig } from "../config/serverConfig";
import { JWTUser } from "../dto/user.dto";
import { IUser } from "../interfaces/user.interface";

function generateAuthToken(user: IUser) {
  const payload = {
    id: user.id,
    username: user.username,
    roles: user.roles,
    name: user.name,
  };

  const secretKey = serverConfig.JWT_SECRET;

  const options: jwt.SignOptions = {
    expiresIn: serverConfig.JWT_EXPIRE as `${number}${"s" | "m" | "h" | "d"}`,
  };

  const token = jwt.sign(payload, secretKey, options);
  return token;
}

function verifyAuthToken(token: string) {
  try {
    const secretKey = serverConfig.JWT_SECRET;
    const decoded = jwt.verify(token, secretKey) as JWTUser;
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

export { generateAuthToken, verifyAuthToken };
