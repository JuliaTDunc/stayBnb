import {useState, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {useModal} from '../../context/Modal';
import {getReviews, createNewReview,getSpotDetails} from '../../store/spots';
import { FaStar } from 'react-icons/fa';
import './ReviewModal.css'

const ReviewModal = ({spotId}) => {
    const[review,setReview] = useState('');
    const [stars,setStars] = useState(null);
    const [hoverStars, setHoverStars] = useState(null);
    const [errors, setErrors] = useState({});
    const [disableButton, setDisableButton] = useState(true);

    const dispatch= useDispatch();
    const {closeModal} = useModal();

    useEffect(() => {
        setDisableButton(review.length < 10 || stars === 0);
    }, [review, stars]);

    useEffect(()=> {
        return () => {
            setReview('');
            setStars(null);
            setErrors({});
            setDisableButton(true);
        }
    }, [closeModal])

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        return dispatch(createNewReview(spotId, {review, stars}))
        .then(() => {
            dispatch(getReviews(spotId));
            dispatch(getSpotDetails(spotId));
            closeModal();
        })
        .catch(async(res) => {
            const data = await res.json();
            if(data && data.errors){
                setErrors(data.errors)
            }
        })
    };

    return (
        <div>
            <h3 className='review-modal-title'>How was your stay?</h3>
            {errors.message && <p className='review-modal-form'>{errors.message}</p>}
            <form onSubmit={handleSubmit} className='review-modal-form'>
                <textarea
                value ={review}
                className='review-input'
                onChange={(e) => setReview(e.target.value)}
                placeholder='Leave your review here...'
                />
                <div className='star-rating'>
                    {[...Array(5)].map((_, i) => {
                        const starRating = i + 1;
                        return (
                            <FaStar
                            key={i}
                                className={`star ${starRating <= (hoverStars || stars) ? 'filled' : ''}`}
                                onMouseEnter={() => setHoverStars(starRating)}
                                onMouseLeave={() => setHoverStars(stars)}
                            onClick={()=> setStars(starRating)}
                            />
                        )
                    })}
                    <p className='star-text'>Stars</p>
                </div>
                <button type='submit' disabled={disableButton} className='review-modal-button'>Submit Your Review</button>
            </form>
        </div>
    )

};

export default ReviewModal;