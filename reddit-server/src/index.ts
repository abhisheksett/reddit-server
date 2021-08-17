import { MyContext } from 'src/types';
import { UserResolver } from './resolvers/user';
import { PostResolver } from './resolvers/post';
import { HelloResolver } from './resolvers/hello';

import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import mikroConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import redis from "redis";
import session from 'express-session';
import connectRedis from 'connect-redis';


const main = async () => {
    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();
    
    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    app.use(
        session({
            name: 'qid',
            store: new RedisStore({ 
                client: redisClient,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                secure: __prod__,
                sameSite: 'none'
            },
            saveUninitialized: false,
            secret: 'zerwejfkjsbfsdfuweqwesdzdf',
            resave: false
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }): MyContext => ({ em: orm.em, req, res })
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log('server started at port 4000')
    });
}


main();