import { gql } from "@apollo/client";

export const GET_PROJECTS_BY_USER_ID = gql`
    query GetProjects($userId: String!){
        getProjectsByUserId(userId: $userId) {
            projectName
            createdAt
            updatedAt
            projectLanguage
            id
        }
    }
`
export const GET_CONTRIBUTED_PROJECTS_BY_USER_ID = gql`
    query GetProjects($userId: String!){
        getContributedProjectsByUserId(userId: $userId) {
            projectName
            createdAt
            updatedAt
            projectLanguage
            id
        }
    }
`