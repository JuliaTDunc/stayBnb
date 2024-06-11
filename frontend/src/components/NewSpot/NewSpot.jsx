import "./NewSpot.css";
import { useState } from "react";

//MAY NEED TO ADD TYPE="SUBMIT" ON BUTTON


const NewSpot = () => {
    const [address,setAddress] = useState("");
    const [city,setCity] = useState("");
    const [state,setState] = useState("");
    const [country,setCountry] = useState("");

    const handleNewSpotSubmit = () => {
        
    }

return (
    <div className='new-form'>
        <h3 className='form-header'>Create a new Spot</h3>
        <form>
            <section>
                <h4 className="form-header">Where's your place located?</h4>
                <h5 className="form-header">Guests will only get your exact address once they booked a<br/>reservation.</h5>
                <label> Street Address
                    <input type="text"
                    value={address}
                    placeholder="Street Address"
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    />
                </label>
                <label> City
                    <input type="text"
                    value={city}
                    placeholder="City"
                    onChange={(e) => setCity(e.target.value)}
                    required
                    />
                </label>
                <label> State
                    <input type="text"
                        value={state}
                        placeholder="State"
                        onChange={(e) => setState(e.target.value)}
                        required
                    />
                </label>
                <label> Country
                    <input type="text"
                        value={country}
                        placeholder="Country"
                        onChange={(e) => setCountry(e.target.value)}
                        required
                    />
                </label>
            </section>
            <section>
                <h4>Describe your place to guests</h4>
                <p>Mention the best features of your space, any special amentities like fast wifi or parking, and what you love about the neighborhood.</p>
                <textarea placeholder="Please write at least 30 characters." required/>
            </section>
            <section>
                <h4>Create a title for your spot</h4>
                <p>Catch guests' attention with a spot title that highlights what makes your place special.</p>
                <label>
                    <input type="text" placeholder="Name of your spot" required/>
                </label>
            </section>
            <section>
                <h4>Set a base price for your spot</h4>
                <p>Competitive pricing can help your listing stand out and rank higher in search results.</p>
                <label>
                    <input type="number" placeholder="Price per night (USD)" required />
                </label>
            </section>
            <section>
                <h4>Liven up your spot with photos.</h4>
                <p>Submit a link to at least one photo to publish your spot.</p>
                <label>
                    <input type="text" placeholder="Preview Image URL" required />
                    <input type="text" placeholder="Image URL"/>
                    <input type="text" placeholder="Image URL"/>
                    <input type="text" placeholder="Image URL"/>
                    <input type="text" placeholder="Image URL"/>
                </label>
            </section>
            <button onClick={handleNewSpotSubmit}>Create Spot</button>
        </form>
    </div>
)
}
export default NewSpot;