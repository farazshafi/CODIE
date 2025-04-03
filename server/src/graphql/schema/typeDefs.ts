import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
    bio: String
    avatarUrl: String
    isBlocked: Boolean
    isAdmin: Boolean

  }

  type Query {
    getUsers: [User]
  }
`;
