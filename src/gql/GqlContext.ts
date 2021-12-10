import { Request, Response } from "express";
import { PubSub } from "apollo-server-express";

export interface GqlContext {
  req: Request | any;
  res: Response;
  pubsub: PubSub;
}
