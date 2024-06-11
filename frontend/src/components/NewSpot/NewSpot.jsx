import "./NewSpot.css";
import { useState } from "react";

//MAY NEED TO ADD TYPE="SUBMIT" ON BUTTON


const NewSpot = () => {
   const [formData, setFormData] = useState({address: '', city:'',state:'',country:'',name:'',description:'',price: 80, previewImage:''});
    

   const handleChange = (e) => {
    const {name, value} = e.target
    setFormData({
        ...formData,
        [name]: value
    })
   }
    const handleNewSpotSubmit = async (e) => {
            e.preventDefault();
            const spotData = {...formData} //check to see if necessary
            
            try{
                const res = await fetch('/api/spots',{
                    method: 'POST',
                    headers:{
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(spotData)
                });
                const newSpot = await res.json();
                console.log(newSpot)
            } catch (error){

            }
    };
    

return (
    <div className='new-form'>
        <h3 className='form-header'>Create a new Spot</h3>
        <form onSubmit={handleNewSpotSubmit}>
            <section>
                <h4 className="form-header">Where's your place located?</h4>
                <h5 className="form-header">Guests will only get your exact address once they booked a<br/>reservation.</h5>
                    <input type="text"
                        value={formData.address}
                        name='address'
                        placeholder="Street Address"
                        onChange={handleChange}
                        required
                    />
                    <input type="text"
                        value={formData.city}
                        name='city'
                        placeholder="City"
                        onChange={handleChange}
                        required
                    />
                    <input type="text"
                        value={formData.state}
                        name='state'
                        placeholder="State"
                        onChange={handleChange}
                        required
                    />
                    <input type="text"
                        value={formData.country}
                        name='country'
                        placeholder="Country"
                        onChange={handleChange}
                        required
                    />
            </section>
            <section>
                <h4>Describe your place to guests</h4>
                <p>Mention the best features of your space, any special amentities like fast wifi or parking, and what you love about the neighborhood.</p>
                <textarea 
                name='description'
                value={formData.description}
                placeholder="Please write at least 30 characters." 
                onChange={handleChange}
                required/>
            </section>
            <section>
                <h4>Create a title for your spot</h4>
                <p>Catch guests' attention with a spot title that highlights what makes your place special.</p>
                    <input type="text"
                        value={formData.name}
                        name='name'
                        placeholder="Title"
                        onChange={handleChange}
                        required
                    />
            </section>
            <section>
                <h4>Set a base price for your spot</h4>
                <p>Competitive pricing can help your listing stand out and rank higher in search results.</p>
                    <input type="number"
                    value={formData.price}
                     placeholder="Price per night (USD)"
                     onChange={handleChange}
                    required />
            </section>
            <section>
                <h4>Liven up your spot with photos.</h4>
                <p>Submit a link to at least one photo to publish your spot.</p>
                <label>
                    <input type="text"
                     placeholder="Preview Image URL"
                     name='previewImage'
                     value={FormDataEvent.previewImage}
                     required
                     />
                    <input type="text" placeholder="Image URL"/>
                    <input type="text" placeholder="Image URL"/>
                    <input type="text" placeholder="Image URL"/>
                    <input type="text" placeholder="Image URL"/>
                </label>
            </section>
            <button type='submit'>Create Spot</button>
        </form>
    </div>
)
}
export default NewSpot;