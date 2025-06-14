// src/types/express.d.ts

import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        id: string;
        roles: string[];
        name?: string;
        email?: string;
      };
    }
  }
}

export {};
