import { Session } from 'express-session';
import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Request, Response } from "express";

export type SessionWithUser = Session & { userId?: number | {}};

export type MyContext = {
    em: EntityManager<IDatabaseDriver<Connection>>;
    req: Request & { session: SessionWithUser};
    res: Response;
}