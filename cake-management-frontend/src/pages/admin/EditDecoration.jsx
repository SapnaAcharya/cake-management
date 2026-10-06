import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import decorationService from "../../services/admindecorationService";
import { getImageUrl } from "../../utils/imageUrl";
import "../../styles/AddCake.css";

const CATEGORY_SUGGESTIONS = [
    "Flowers",
    "Pearls",
    "Sprinkles",
    "Macarons",
    "Candles",
    "Toppers"
];

const OCCASION_SUGGESTIONS = [
    "Birthday",
    "Wedding",
    "Anniversary",
    "Graduation"
];

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function EditDecoration(){

    const navigate = useNavigate();

    const { id } = useParams();

    const [formData,setFormData] = useState({

        name:"",
        category:"",
        price:"",
        occasion:"",
        isActive:true

    });

    const [existingImage,setExistingImage] = useState(null);

    const [imageFile,setImageFile] = useState(null);

    const [imagePreview,setImagePreview] = useState(null);

    const [loading,setLoading] = useState(false);

    const [initialLoading,setInitialLoading] = useState(true);

    const [error,setError] = useState("");

    // Load existing decoration

    useEffect(()=>{

        const loadDecoration = async()=>{

            try{
                const decoration =
                    await decorationService.getDecorationById(id);

                setFormData({

                    name: decoration.name || "",

                    category: decoration.category || "",

                    price: decoration.price ?? "",

                    occasion: decoration.occasion || "",

                    isActive:
                    decoration.isActive ?? true

                });

                setExistingImage(
                    decoration.imageUrl || null
                );

            }
            catch (err) {
                console.error("Load decoration failed:", err);
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to load decoration details."
                );

            }
            finally{

                setInitialLoading(false);

            }

        };

        loadDecoration();


    },[id]);





    const handleChange=(e)=>{


        const {
            name,
            value,
            type,
            checked
        }=e.target;



        setFormData(prev=>({

            ...prev,

            [name]:
            type==="checkbox"
            ?
            checked
            :
            value

        }));

    };






    const validateImage=(file)=>{


        if(!ALLOWED_IMAGE_TYPES.includes(file.type)){

            setError(
                "Only JPG, PNG and WEBP images are allowed."
            );

            return false;

        }



        if(file.size > MAX_IMAGE_SIZE){

            setError(
                "Image must be below 5MB."
            );

            return false;

        }



        return true;

    };






    const handleImageChange=(e)=>{


        const file=e.target.files[0];


        if(!file || !validateImage(file))
            return;



        setError("");

        setImageFile(file);

        setImagePreview(
            URL.createObjectURL(file)
        );


    };







    const handleSubmit=async(e)=>{


        e.preventDefault();


        setLoading(true);

        setError("");



        try{


            let imageUrl = existingImage;



            // upload only if replaced

            if(imageFile){


                const uploaded =
                    await decorationService.uploadDecorationImage(
                        imageFile,
                        formData.category
                    );

                console.log("Uploaded image response:", uploaded);
                imageUrl = uploaded.url;

            }

            console.log("Final imageUrl being saved:", imageUrl);

            await decorationService.updateDecoration(
                id,
                {

                    name:formData.name,

                    category:formData.category,

                    imageUrl:imageUrl,

                    price:Number(formData.price),

                    occasion:formData.occasion,

                    isActive:formData.isActive

                }
            );



            navigate(
                "/admin/decorations"
            );


        }
        catch(err){


            setError(
                err.message ||
                "Failed to update decoration."
            );


        }
        finally{

            setLoading(false);

        }


    };





    if(initialLoading){

        return (

        <AdminLayout

        title="Edit Decoration"

        subtitle="Loading decoration details..."

        >

        <div className="add-cake-card">

        Loading...

        </div>


        </AdminLayout>

        );

    }







return (

<AdminLayout

title="Edit Decoration"

subtitle="Update decoration details."

>


<div className="add-cake-card">


{
error &&

<div className="add-cake-error">

{error}

</div>

}



<form

onSubmit={handleSubmit}

className="add-cake-form"

>




<div className="add-cake-field">

<label htmlFor="decoration-name">
Decoration Name
</label>


<input
id ="decoration-name"
type="text"

name="name"

value={formData.name}

onChange={handleChange}

required

/>

</div>

<div className="add-cake-row">

<div className="add-cake-field">

<label htmlFor="decoration-category">
Category
</label>

<input
id="decoration-category"
type="text"

name="category"

list="category-list"

value={formData.category}

onChange={handleChange}

required

/>


<datalist id="category-list">

{
CATEGORY_SUGGESTIONS.map(item=>(

<option
key={item}
value={item}
/>

))
}

</datalist>

</div>

<div className="add-cake-field">

<label htmlFor="decoration-price">
Price
</label>

<input
id="decoration-price"
type="number"

name="price"

value={formData.price}

onChange={handleChange}

min="0"

required

/>

</div>

</div>








<div className="add-cake-field">

<label htmlFor="decoration-occasion">
Occasion
</label>


<input
id="decoration-occasion"
type="text"

name="occasion"

list="occasion-list"

value={formData.occasion}

onChange={handleChange}

/>



<datalist id="occasion-list">

{
OCCASION_SUGGESTIONS.map(item=>(

<option
key={item}
value={item}
/>

))
}

</datalist>


</div>







<div className="add-cake-field">

<label>
Decoration Image
</label>



{
imagePreview ?

<div className="add-cake-preview">

<img
src={imagePreview}
alt="New preview"
/>


<button

type="button"

className="add-cake-remove-image"

onClick={()=>{

setImageFile(null);

setImagePreview(null);

}}

>

Cancel New Image

</button>


</div>



:

existingImage ?

<div className="add-cake-preview">


<img

// src={existingImage}
src={getImageUrl(existingImage)}

alt={formData.name}

/>



<label

className="add-cake-btn-secondary"

style={{
cursor:"pointer",
display:"inline-block",
marginTop:"10px"
}}

>

Replace Image


<input

type="file"

accept="image/jpeg,image/png,image/webp"

hidden

onChange={handleImageChange}

/>


</label>


</div>


:

<label className="add-cake-dropzone">


<input

type="file"

hidden

accept="image/jpeg,image/png,image/webp"

onChange={handleImageChange}

/>


<span>
Choose Image
</span>


</label>

}


</div>








<label className="add-cake-checkbox">


<input

type="checkbox"

name="isActive"

checked={formData.isActive}

onChange={handleChange}

/>


Active Decoration


</label>







<div className="add-cake-actions">


<button

type="button"

className="add-cake-btn-secondary"

onClick={()=>
navigate("/admin/decorations")
}

>

Cancel

</button>





<button

type="submit"

className="add-cake-btn-primary"

disabled={loading}

>


{
loading
?
"Updating..."
:
"Update Decoration"
}


</button>



</div>




</form>


</div>


</AdminLayout>


);


}



export default EditDecoration;