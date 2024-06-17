import "./NewSpot.css";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from 'react-router-dom';
import { getSpotDetails, updateUserSpots, createNewSpot, createNewImage } from "../../store/spots";

const NewSpot = () => {
   
    let { spotId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const spotRef = useRef({});

    const spot = useSelector((state) => state.spots.currSpot);
  

    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [country, setCountry] = useState("");
    const [description, setDescription] = useState("");
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [previewImageUrl, setPreviewImageUrl] = useState("");
    const [secondImg, setSecondImg] = useState("");
    const [thirdImg, setThirdImg] = useState("");
    const [fourthImg, setFourthImg] = useState("");
    const [fifthImg, setFifthImg] = useState("");
    const [errors,setErrors] = useState({});

    const validationErrors = () => {
        const newErr = {};
        if (!address) newErr.address = 'Address is required';
        if (!city) newErr.city = 'City is required';
        if (!state) newErr.state = 'State is required';
        if (!country) newErr.country = 'Country is required';
        if (description.length < 30) newErr.description = 'Description needs 30 or more characters';
        if (description.length > 255) newErr.description = 'Description must be 255 characters or less';
        if (!name) newErr.name = 'Name is required';
        if (name.length > 50) newErr.name = 'Name must be less than 50 characters';
        if (!price) newErr.price = 'Price per night is required';
        if (price < 0) newErr.price = 'Price per day must be a positive number';
        if (!spotId && !previewImage) newErr.previewImage = 'A preview image URL is required';
        return newErr;
    }

    useEffect(() => {
        if (spotId) {
            dispatch(getSpotDetails(spotId));
        }
    }, [dispatch, spotId]);

    useEffect(() => {
        if (spot && spotId) {
            setAddress(spot.address || "");
            setCity(spot.city || "");
            setState(spot.state || "");
            setCountry(spot.country || "");
            setDescription(spot.description || "");
            setName(spot.name || "");
            setPrice(spot.price || "");
            setPreviewImageUrl(spot.previewImageUrl || "");
        }
    }, [spot, spotId]);

    const handleChange = (setField, field) => (e) => {
        setField(e.target.value);
        if(errors[field]){
            setErrors((prevErr) => {
                const newErr = {...prevErr};
                delete newErr[field];
                return newErr;
            })
        }
        
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();
       
        const formErrors = validationErrors();

        const images = [previewImageUrl, secondImg, thirdImg, fourthImg, fifthImg].filter(url => url);
        const invalidPaths = images.filter(url => {
            const extension = url.split('.').pop().toLowerCase();
            return !['png', 'jpg', 'jpeg'].includes(extension);
        });
        if (invalidPaths.length > 0) {
            
            setErrors(prevErrors => ({
                ...prevErrors,
                previewImageUrl: 'Image URL needs to end in png, jpg or jpeg'
            }))
            return;
        }

        if (Object.keys(formErrors).length > 0) {
            
            setErrors(formErrors);
            const firstErrorField = Object.keys(formErrors)[0];
            spotRef.current[firstErrorField].scrollIntoView({ behavior: 'smooth' });
        } else {
            const spotData = {
                address,
                city,
                state,
                country,
                description,
                name,
                price: parseFloat(price)
            };
            try {
                if (spotId) {
                 await dispatch(updateUserSpots(spotId, spotData));
                  
        

                } else {
                  
                    const newSpot = await dispatch(createNewSpot(spotData));
           
                    spotId = newSpot.id
                }

                    console.log('IMAGE ARRAY>>>>' , images)
                    const imgTest = images.map((image, index) => {
                        const payload = {
                            url: image,
                            preview: index === 0
                        }
                        return dispatch(createNewImage(spotId, payload))
                    })
                    await Promise.all(imgTest);
                    navigate(`/spots/${spot.id}`);
            } catch (res) {
                if (res instanceof Response) {  
                const data = await res.json();
               
                if (data && data.errors) {
                    setErrors(data.errors);
                }
            }else {
                console.log('res not type of response...', res)
            }
            }
        }
    }

    return (
        <div className='new-form'>
            <h3 className='form-header'>{spotId ? 'Edit Spot' : 'Create a new Spot'}</h3>
            <form onSubmit={handleFormSubmit}>
                <section>
                    <h4 className="form-header">Where's your place located?</h4>
                    <h5 className="form-header">Guests will only get your exact address once they booked a<br />reservation.</h5>
                    <input
                        type="text"
                        value={address}
                        name='address'
                        placeholder="Street Address"
                        onChange={handleChange(setAddress, 'address')}
                        ref={(e) => spotRef.current.address = e}
                        required
                    />
                    <input
                        type="text"
                        value={city}
                        name='city'
                        placeholder="City"
                        onChange={handleChange(setCity, 'city')}
                        ref={(e) => spotRef.current.city = e}
                        required
                    />
                    <input
                        type="text"
                        value={state}
                        name='state'
                        placeholder="State"
                        onChange={handleChange(setState, 'state')}
                        ref={(e) => spotRef.current.state = e}
                        required
                    />
                    <input
                        type="text"
                        value={country}
                        name='country'
                        placeholder="Country"
                        onChange={handleChange(setCountry, 'country')}
                        ref={(e) => spotRef.current.country = e}
                        required
                    />
                </section>
                <section>
                    <h4>Describe your place to guests</h4>
                    <p>Mention the best features of your space, any special amenities like fast wifi or parking, and what you love about the neighborhood.</p>
                    <textarea
                        name='description'
                        value={description}
                        placeholder="Please write at least 30 characters."
                        onChange={handleChange(setDescription,'description')}
                        ref={(e) => spotRef.current.description = e}
                        required
                    />
                </section>
                <section>
                    <h4>Create a title for your spot</h4>
                    <p>Catch guests' attention with a spot title that highlights what makes your place special.</p>
                    <input
                        type="text"
                        value={name}
                        name='name'
                        placeholder="Title"
                        onChange={handleChange(setName, 'name')}
                        ref={(e) => spotRef.current.name = e}
                        required
                    />
                </section>
                {errors.name && <p className='create-spot-error'>{errors.name}</p>}
                <section>
                    <h4>Set a base price for your spot</h4>
                    <p>Competitive pricing can help your listing stand out and rank higher in search results.</p>
                    <input
                        type="number"
                        value={price}
                        name="price"
                        placeholder="Price per night (USD)"
                        onChange={handleChange(setPrice, 'price')}
                        ref={(e) => spotRef.current.price = e}
                        required
                    />
                </section>
                <section>
                    <h4>Liven up your spot with photos.</h4>
                    <p>Submit a link to at least one photo to publish your spot.</p>
                    <label>
                        <input
                            type="text"
                            placeholder="Preview Image URL"
                            name='previewImage'
                            value={previewImageUrl}
                            onChange={handleChange(setPreviewImageUrl, 'previewImage')}
                            ref={(e) => spotRef.current.previewImage = e}
                            required
                        />
                        <input type="text" className='extra-img' placeholder="Image URL"
                            onChange={(e) => setSecondImg(e.target.value)} />
                        <input type="text" className='extra-img' placeholder="Image URL" 
                            onChange={(e) => setThirdImg(e.target.value)}/>
                        <input type="text" className='extra-img' placeholder="Image URL"
                            onChange={(e) => setFourthImg(e.target.value)}/>
                        <input type="text" className='extra-img' placeholder="Image URL"
                            onChange={(e) => setFifthImg(e.target.value)} />
                    </label>
                </section>
                <button type='submit'>{spotId ? 'Update Spot' : 'Create Spot'}</button>
            </form>
        </div>
    );
}

export default NewSpot;
