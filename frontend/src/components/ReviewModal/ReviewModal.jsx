import {useState, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {getReviews, createNewReview,getSpotDetails} from '../../store/spots';
import './ReviewForm.css'

const ReviewModal = ({spotId}) => {
    const[review,setReciew] = uesState('');
    const [stars,setStars] = useState('';
        
    )
}