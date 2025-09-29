import API from "@/lib/axiosInstance";


export const createCommentApi = async (data: { comment: string, projectId: string }) => {
    try {
        const response = await API.post("/comment", data)
        return response.data
    } catch (error) {
        console.log("Error while creating comment");
        throw error;
    }
}

export const getAllCommentsApi = async (projectId: string) => {
    try {
        const response = await API.get(`comment/${projectId}`,)
        return response.data
    } catch (error) {
        console.log("Error while getting comments");
        throw error;
    }
}

export const likeCommentApi = async (commentId: string) => {
    try {
        const response = await API.post(`/comment/${commentId}/like`,)
        return response.data
    } catch (error) {
        console.log("Error while like a  comments");
        throw error;
    }
}

