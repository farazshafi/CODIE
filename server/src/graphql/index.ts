
import {ApolloServer} from "apollo-server-express"

import { typeDefs } from "./schema/typeDefs"
import { resolvers } from "./resolvers/resolver"

export async function setupGraphQl(app) {
    const server = new ApolloServer({typeDefs,resolvers})
    await server.start()
    server.applyMiddleware({app,path:"/graphql"})

    console.log(`GraphQL ready at http://localhost:${process.env.PORT || 3000}/graphql`);
}