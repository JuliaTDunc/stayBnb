import "./NewSpot.css";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from 'react-router-dom';
import { getSpots, getSpotDetails, updateUserSpots, createNewSpot, createNewImage } from "../../store/spots"; // Import the appropriate action
import { ValidationError } from "sequelize";

const NewSpot = () => {
   
    const { spotId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const spotRefs = useRef({});

    const spot = useSelector((state) => state.spots.currSpot);

    const [formData, setFormData] = useState({
        address: '',
        city: '',
        state: '',
        country: '',
        name: '',
        description: '',
        price: '',
        previewImage: '',
        secondImg: '',
        thirdImg: '',
        fourthImg: '',
        fifthImg: '',
    });
    const [errors,setErrors] = useState({});

    useEffect(() => {
        if (spotId) {
            dispatch(getSpotDetails(spotId)); // Fetch spot details if spotId exists
        }
    }, [dispatch, spotId]);

    useEffect(() => {
        if (spot && spotId) {
            setFormData((prevData)=> ({
                ...prevData,
                address: spot.address|| '',
                city: spot.city|| '',
                state: spot.state|| '',
                country: spot.country|| '',
                name: spot.name|| '',
                description: spot.description|| '',
                price: spot.price|| '',
                previewImage: spot.previewImage|| '',
            }));
        }
    }, [spot, spotId]);

    const handleChange = (field) => (e) => {
        const {value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [field]: value
        }))
        if(errors[field]){
            setErrors((prevErrors)=> {
                const newErrors = {...prevErrors};
                delete newErrors[field];
                return newErrors;
            })
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const spotData = { ...formData, price: parseFloat(formData.price) };
        try {
            if (spotId) {
                const updatedSpot = await dispatch(updateUserSpots(spotId, spotData));
                navigate(`/spots/${updatedSpot.id}`)
            } else {
                const newSpot = await dispatch(createNewSpot(spotData));
                const images = [
                    previewImage,
                    secondImg,
                    thirdImg,
                    fourthImg,
                    fifthImg,
                ];
                const displayPreview = images[0] ? 'true' : 'false';
                const imgTest = images.map((u) => {
                    const payload = {
                        u,
                        displayPreview
                    }
                    return dispatch(createNewImage(newSpot.id, payload))
                })
                await Promise.all(imgTest, payload);
                navigate(`/spots/${newSpot.id}`)
            }
        } catch (res) {
            const data = await res.json();
            if(data && data.errors){
                setErrors(data.errors)
            }
        }
    };

    return (
        <div className='new-form'>
            <h3 className='form-header'>{spotId ? 'Edit Spot' : 'Create a new Spot'}</h3>
            <form onSubmit={handleFormSubmit}>
                <section>
                    <h4 className="form-header">Where's your place located?</h4>
                    <h5 className="form-header">Guests will only get your exact address once they booked a<br />reservation.</h5>
                    <input
                        type="text"
                        value={formData.address}
                        name='address'
                        placeholder="Street Address"
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        value={formData.city}
                        name='city'
                        placeholder="City"
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        value={formData.state}
                        name='state'
                        placeholder="State"
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        value={formData.country}
                        name='country'
                        placeholder="Country"
                        onChange={handleChange}
                        required
                    />
                </section>
                <section>
                    <h4>Describe your place to guests</h4>
                    <p>Mention the best features of your space, any special amenities like fast wifi or parking, and what you love about the neighborhood.</p>
                    <textarea
                        name='description'
                        value={formData.description}
                        placeholder="Please write at least 30 characters."
                        onChange={handleChange}
                        required
                    />
                </section>
                <section>
                    <h4>Create a title for your spot</h4>
                    <p>Catch guests' attention with a spot title that highlights what makes your place special.</p>
                    <input
                        type="text"
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
                    <input
                        type="number"
                        value={formData.price}
                        name="price"
                        placeholder="Price per night (USD)"
                        onChange={handleChange}
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
                            value={formData.previewImage}
                            onChange={handleChange}
                            required
                        />
                        <input type="text" placeholder="Image URL" />
                        <input type="text" placeholder="Image URL" />
                        <input type="text" placeholder="Image URL" />
                        <input type="text" placeholder="Image URL" />
                    </label>
                </section>
                <button type='submit'>{spotId ? 'Update Spot' : 'Create Spot'}</button>
            </form>
        </div>
    );
}

export default NewSpot;
