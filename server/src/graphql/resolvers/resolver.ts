import redis from "../../config/redis";
import { UserRepository } from "../../repositories/userRepositories";


export const resolvers = {
    Query: {
        getUsers: async () => {

            const key = "getUsers";

            const cachedData = await redis.get(key)
            if (cachedData) {
                console.log("Returning cached data from Redis");
                return JSON.parse(cachedData)
            } else {
                const allUsers = await UserRepository.getUsers();
                await redis.set(key, JSON.stringify(allUsers), "EX", 60)

                console.log("GraphQL returning users:", allUsers);
                return allUsers;
            }
        }

    }
}
