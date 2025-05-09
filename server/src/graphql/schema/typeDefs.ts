import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Project {
    id: ID!
    projectName: String
    projectCode: String
    projectLanguage: String
    userId: String
    createdAt: String
    updatedAt: String
  }

  type Query {
    getProjectsByUserId(userId: String!): [Project],
    getContributedProjectsByUserId(userId: String!): [Project]
  }
`;

