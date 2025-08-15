import API from "@/lib/axiosInstance";

interface DiscoverQuery {
  keyword?: string;
  language?: string;
  page?: number;
  limit?: number;
}

export const findDiscoveriesApi = async (params: DiscoverQuery) => {
  try {
    const response = await API.get("/discover", { params });
    return response.data.discoveries;
  } catch (error) {
    console.log("Error while getting Discoveries");
    throw error;
  }
};

export const shareDiscoverApi = async (projectId: string) => {
  try {
    const response = await API.post("/discover/share", { projectId });
    return response.data;
  } catch (error) {
    console.log("Error while sharing Discoveries");
    throw error;
  }
};

export const removeFromDiscoverApi = async (projectId: string) => {
  try {
    const response = await API.delete(`/discover/${projectId}`);
    return response.data;
  } catch (error) {
    console.log("Error while sharing Discoveries");
    throw error;
  }
};

export const explainCodeApi = async (code: string) => {
  try {
    const response = await API.post(`/discover/explain`, { code });
    return response.data;
  } catch (error) {
    console.log("Error while explaing code");
    throw error;
  }
};
