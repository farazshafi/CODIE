import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/project`

export const createProjectApi = async (userData: { projectName: string, projectLanguage: string, projectCode: string }) => {
    try {
        const userStorage = localStorage.getItem("user-storage");
        if (!userStorage) {
            throw new Error("User storage not found in localStorage");
        }
        const token = JSON.parse(userStorage).state.user.token;
        const response = await axios.post(
            `${API_BASE_URL}/create_project`,
            userData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (err) {
        console.log("Error while Creating Project", err);
        throw err;
    }
}
