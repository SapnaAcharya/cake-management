import { API_ORIGIN } from "../config/apiConfig";

export const getImageUrl = (path) => {
    if (!path) {
        return "/placeholder-cake.png";
    }

    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    return `${API_ORIGIN}${path}`;
};