import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import decorationService from "../../services/decorationService";
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
    "Graduation",
    "Baby Shower"
];


const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
];


const MAX_IMAGE_SIZE = 5 * 1024 * 1024;



function AddDecoration(){

    const navigate = useNavigate();


    const [formData,setFormData] = useState({

        name:"",
        category:"",
        price:"",
        occasion:"",
        isActive:true

    });


    const [imageFile,setImageFile] = useState(null);

    const [imagePreview,setImagePreview] = useState(null);


    const [loading,setLoading] = useState(false);

    const [error,setError] = useState("");




    const handleChange=(e)=>{

        const {
            name,
            value,
            type,
            checked
        } = e.target;


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
                "Image size must be below 5MB."
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


        setError("");



        if(!imageFile){

            setError(
                "Decoration image is required."
            );

            return;

        }



        setLoading(true);



        try{


            // 1. Upload Image

            const uploadResult =
                await decorationService.uploadDecorationImage(
                    imageFile,
                    formData.category
                );



            // 2. Save Decoration

            await decorationService.createDecoration({

                name:formData.name,

                category:formData.category,

                imageUrl:
                uploadResult.url,

                price:
                Number(formData.price),

                occasion:
                formData.occasion,

                isActive:
                formData.isActive

            });



            navigate(
                "/admin/decorations"
            );


        }
        catch(err){

            setError(
                err.message ||
                "Failed to add decoration."
            );

        }
        finally{

            setLoading(false);

        }

    };





return (

<AdminLayout

title="Add New Decoration"

subtitle="Create a decoration item for cake customization."

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

<label>
Decoration Name
</label>


<input

type="text"

name="name"

value={formData.name}

onChange={handleChange}

placeholder="Example: Red Rose"

required

/>

</div>





<div className="add-cake-row">


<div className="add-cake-field">

<label>
Category
</label>


<input

type="text"

name="category"

list="category-list"

value={formData.category}

onChange={handleChange}

placeholder="Flowers"

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

<label>
Price
</label>


<input

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

<label>
Occasion
</label>


<input

type="text"

name="occasion"

list="occasion-list"

value={formData.occasion}

onChange={handleChange}

placeholder="Birthday"

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
!imagePreview ?

<label className="add-cake-dropzone">


<input

type="file"

accept="image/jpeg,image/png,image/webp"

hidden

onChange={handleImageChange}

/>


<span>
Click to choose image
</span>


</label>


:

<div className="add-cake-preview">


<img

src={imagePreview}

alt="preview"

/>


<button

type="button"

className="add-cake-remove-image"

onClick={()=>{

setImageFile(null);

setImagePreview(null);

}}

>

Remove

</button>


</div>

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
"Saving..."
:
"Add Decoration"
}


</button>


</div>



</form>


</div>


</AdminLayout>


);


}


export default AddDecoration;