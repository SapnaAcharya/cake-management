import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import decorationService from "../../services/admindecorationService";
import { useNavigate } from "react-router-dom";

import "../../styles/AdminDashboard.css";
import { getImageUrl } from "../../utils/imageUrl";

function AdminDecorations() {

  const navigate = useNavigate();


  const [decorations, setDecorations] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("all");



  // Load decorations

  const fetchDecorations = async () => {

    setLoading(true);
    setError("");

    try {

      const data = await decorationService.getDecorations();

      console.log("Decoration API Response:", data);

      setDecorations(data.items || data || []);

    }
    catch(err){

      setError(
        err.response?.data?.message ||
        "Failed to load decorations. Please try again."
      );

    }
    finally{

      setLoading(false);

    }

  };



  useEffect(()=>{

    let ignore = false;


    const load = async()=>{

      setLoading(true);
      setError("");


      try{

        const data =
          await decorationService.getDecorations();


        if(!ignore){

          setDecorations(
            data.items || data || []
          );

        }

      }
      catch(err){

        if(!ignore){

          setError(
            err.response?.data?.message ||
            "Failed to load decorations."
          );

        }

      }
      finally{

        if(!ignore)
          setLoading(false);

      }

    };


    load();


    return ()=>{

      ignore=true;

    };


  },[]);




  // Categories for filter

  const categories = [
    ...new Set(
      decorations
        .map(item=>item.category)
        .filter(Boolean)
    )
  ];




  // Search + filter

  const filteredDecorations =
    decorations.filter((item)=>{


      const matchesSearch =
        item.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );


      const matchesCategory =
        categoryFilter==="all" ||
        item.category===categoryFilter;



      return (
        matchesSearch &&
        matchesCategory
      );

    });




  const handleEdit = (decoration)=>{

    navigate(
      `/admin/decorations/${decoration.id}/edit`
    );

  };





  const handleDelete = async(decoration)=>{


    const confirmed =
      window.confirm(
        `Delete "${decoration.name}"? This can't be undone.`
      );


    if(!confirmed)
      return;



    try{


      await decorationService.deleteDecoration(
        decoration.id
      );


      setDecorations(prev=>
        prev.filter(
          item=>item.id !== decoration.id
        )
      );


    }
    catch(err){

      alert(
        err.response?.data?.message ||
        "Failed to delete decoration."
      );

    }


  };





return (

<AdminLayout

 title="Manage Decorations"

 subtitle="View, add, edit and delete cake decorations used for customization."

 headerAction={

 <button

 className="admin-primary-btn"

 onClick={()=>
   navigate("/admin/decorations/add")
 }

 >

 <Plus size={16}/>

 Add New Decoration

 </button>

 }

>


<div className="manage-cakes-card">


{/* Filters */}

<div className="manage-cakes-filters">


<div className="manage-cakes-search">

<Search size={16}/>


<input

type="text"

placeholder="Search decorations..."

value={search}

onChange={
(e)=>setSearch(e.target.value)
}

/>


</div>



<div className="manage-cakes-select">


<select className="category-filter-select"

value={categoryFilter}

onChange={
(e)=>setCategoryFilter(e.target.value)
}

>

<option value="all">
All Categories
</option>


{
categories.map(category=>(

<option
key={category}
value={category}
>

{category}

</option>

))
}


</select>


{/* <ChevronDown size={15}/> */}


</div>


</div>





{
loading &&

<div className="manage-cakes-status">

Loading decorations...

</div>

}




{
!loading && error &&

<div className="manage-cakes-status error">

{error}


<button

className="retry-link"

onClick={fetchDecorations}

>

Retry

</button>


</div>

}





{
!loading &&
!error &&
filteredDecorations.length===0 &&


<div className="manage-cakes-status">

{
search
?
"No decorations match your search."
:
"No decorations yet. Add your first one."
}

</div>


}






{
!loading &&
!error &&
filteredDecorations.length>0 &&


<div className="manage-cakes-table-wrap">


<table className="manage-cakes-table">


<thead>

<tr>

<th>S.N.</th>

<th>ID</th>

<th>Image</th>

<th>Name</th>

<th>Category</th>

<th>Price</th>

<th>Occasion</th>

<th>Status</th>

<th>Actions</th>


</tr>


</thead>



<tbody>


{
filteredDecorations.map(
(decoration,index)=>(


<tr key={decoration.id}>


<td>
{index+1}
</td>



<td>
{decoration.id}
</td>



<td>


<img

src={getImageUrl(decoration.imageUrl)}

alt={decoration.name}

className="cake-thumb"

/>


</td>



<td>
{decoration.name}
</td>



<td>
{decoration.category}
</td>



<td>

Rs {Number(
decoration.price
).toFixed(2)}

</td>




<td>

{decoration.occasion}

</td>




<td>

<span

className={`status-pill ${
decoration.isActive
?
"available"
:
"unavailable"
}`}

>

{
decoration.isActive
?
"Active"
:
"Inactive"
}

</span>


</td>




<td>


<div className="row-actions">


<button

className="row-action-btn edit"

onClick={()=>
handleEdit(decoration)
}

>

<Pencil size={14}/>

</button>




<button

className="row-action-btn delete"

onClick={()=>
handleDelete(decoration)
}

>

<Trash2 size={14}/>

</button>


</div>


</td>


</tr>


))

}



</tbody>


</table>


</div>

}




<div className="manage-cakes-footer">


<span>

Showing 1 to {filteredDecorations.length}
of {decorations.length} decorations

</span>



<div className="pagination">


<button className="page-btn">

<ChevronLeft size={15}/>

</button>



<button className="page-btn active">

1

</button>



<button className="page-btn">

<ChevronRight size={15}/>

</button>



</div>


</div>



</div>


</AdminLayout>

);


}


export default AdminDecorations;