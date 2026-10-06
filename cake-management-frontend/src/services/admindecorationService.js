import API_BASE_URL  from "../config/apiConfig";

const getAuthHeaders = (isFormData = false) => {
    const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

    const headers = {
        Authorization: `Bearer ${token}`
    };

    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
};

// Get all decorations: Get /api/decorations
const getDecorations = async () => {
    const response = await fetch(
        `${API_BASE_URL}/decorations`
    );

    if(!response.ok) {
        throw new Error(
            "Failed to fetch decorations"
        );
    }
   return await response.json();
}

// Get decoration by Id: Get /api/decorations/{id}
const getDecorationById = async(id)=>{

    const response = await fetch(
        `${API_BASE_URL}/decorations/${id}`
    );


    if(!response.ok){
        throw new Error(
            "Failed to fetch decoration"
        );
    }


    return await response.json();
};

// Filter decorations by category: get /api/decorations/{category}
const getDecorationsByCategory = async(category)=>{

    const response = await fetch(
        `${API_BASE_URL}/decorations/category/${category}`
    );


    if(!response.ok){
        throw new Error(
            "Failed to fetch category decorations"
        );
    }


    return await response.json();

};

 // create decoration: post /api/decorations
 const createDecoration = async(decorationData)=>{

    const response = await fetch(
        `${API_BASE_URL}/decorations`,
        {
            method:"POST",

            headers:getAuthHeaders(),

            body:JSON.stringify(decorationData)
        }
    );


    if(!response.ok){
        throw new Error(
            "Failed to create decoration"
        );
    }


    return await response.json();
};

// Upload image: post /api/decorations/upload-image
const uploadDecorationImage = async(file, category)=>{


    const formData = new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "category",
        category
    );


    const response = await fetch(
        `${API_BASE_URL}/decorations/upload-image`,
        {
            method:"POST",

            headers:getAuthHeaders(true),

            body:formData
        }
    );


    if(!response.ok){
        throw new Error(
            "Failed to upload decoration image"
        );
    }


    return await response.json();

};

// update decoration: put /api/decorations/{id}
const updateDecoration = async(
    id,
    decorationData
)=>{


    const response = await fetch(
        `${API_BASE_URL}/decorations/${id}`,
        {
            method:"PUT",

            headers:getAuthHeaders(),

            body:JSON.stringify(decorationData)
        }
    );


    if(!response.ok){
        throw new Error(
            "Failed to update decoration"
        );
    }


    return await response.json();

};

// Delete decorations Delete: /api/decorations?{id}
const deleteDecoration = async(id)=>{


    const response = await fetch(
        `${API_BASE_URL}/decorations/${id}`,
        {
            method:"DELETE",

            headers:getAuthHeaders()
        }
    );


    if(!response.ok){
        throw new Error(
            "Failed to delete decoration"
        );
    }


    return true;

};

const decorationService = {

    getDecorations,

    getDecorationById,

    getDecorationsByCategory,

    createDecoration,

    uploadDecorationImage,

    updateDecoration,

    deleteDecoration

};


export default decorationService;

