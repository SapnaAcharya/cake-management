import API_BASE_URL from "../config/apiConfig";

// Get all active decorations
const getDecorations = async () => {
    const response = await fetch(
        `${API_BASE_URL}/decorations`
    );

    if (!response.ok) {
        throw new Error("Failed to load decorations");
    }

    const decorations = await response.json();

    return decorations.filter(
        (decoration) => decoration.isActive
    );
};

export default {
    getDecorations,
};