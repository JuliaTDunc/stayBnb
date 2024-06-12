import {csrfFetch} from './csrf';
import {createSelector} from 'reselect';

const LOAD_SPOTS = 'spots/loadSpots'
const LOAD_USERS_SPOTS = '/spots/usersSpots';
const SPOT_DETAILS = 'spots/spotDetails'
const LOAD_REVIEWS = 'spots/loadReviews'
const NEW_SPOT = 'spots/newSpot';
const NEW_IMAGE = 'spots/newImage';
const NEW_REVIEW = 'spots/newReview';
const UPDATE_SPOTS = '/spots/updateSpots';
const DELETE_REVIEW = '/spots/deleteReview';
const DELETE_SPOT = '/spots/deleteSpot';


const loadSpots = (payload) => {
    return {
        type: LOAD_SPOTS,
        payload
    }
}
const spotDetails = (spotId) => {
    return {
        type: SPOT_DETAILS,
        payload: spotId
    }
}

const loadReviews = (spotId) => {
    return {
    type: LOAD_REVIEWS,
    payload: spotId
    }
}
const newSpot = (spot) => {
    return {
        type:NEW_SPOT,
        payload: spot
    }
};
const newImage = (spotId, img) => {
    return {
        type: NEW_IMAGE,
        payload: {
            spotId,
            img
        }
    }
};

const newReview = (spotId, review) => {
    return {
        type: NEW_REVIEW,
        payload: {
            spotId,
            review
        }
    }
};

const updateSpots = (spot) => {
    return {
        type: UPDATE_SPOTS,
        spot
    }
};

const loadUsersSpots = (payload) => {
    return {
        type: LOAD_USERS_SPOTS,
        payload
    }
};
const deleteReview =(reviewId) => {
    return {
        type: DELETE_REVIEW,
        payload: reviewId
    }
};
const deleteSpot = (spotId) => {
    return {
        type: DELETE_SPOT,
        payload: spotId
    }
};


export const getSpots = () => async(dispatch) => {
    const res = await csrfFetch('/api/spots');
    if(res.ok){
        const data = await res.json();
        dispatch(loadSpots(data))
    }
}
export const getUserSpots = () => async(dispatch) => {
    const res = await csrfFetch('api/spots/current');
    if(res.ok){
        const data = await res.json();
        dispatch(loadUsersSpots(data))
    }
}
export const getReviews = (spotId) => async(dispatch) => {
    const res = await csrfFetch(`/api/spots/${spotId}/reviews`);
    if(res.ok){
        const data = await res.json();
        dispatch(loadReviews(data))
    }
}
export const getSpotDetails = (spotId) => async(dispatch) => {
    const res = await csrfFetch(`/api/spots/${spotId}`);
    if(res.ok) {
        const data = await res.json();
        dispatch(spotDetails(data));
    }
}
export const createNewSpot = (payload) => async (dispatch) => {
    const res = await csrfFetch('api/spots',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });
    if(res.ok){
        const data = await res.json();
        dispatch(newSpot(data));
        return data;
    }
}
export const createNewImage = (spotId, payload) => async(dispatch) => {
    const {url, displayPreview} = payload;
    const res = await csrfFetch(`api/spots/${spotId}/images`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({url, preview: displayPreview})
    })

    if(res.ok){
        const data = await res.json();
        dispatch(newImage(spotId, data));
        return data;
    }
};

export const createNewReview = (spotId, payload) => async(dispatch) => {
const res = await csrfFetch(`/api/spots/${spotId}/reviews`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
})
if(res.ok){
    const data = await res.json();
    dispatch(newReview(spotId, data));
    return data;
}
};
export const updateUserSpots = (spotId, payload) => async(dispatch) => {
    const res = await csrfFetch(`/api/spots/${spotId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    })
    if(res.ok){
        const data = await res.json();
        dispatch(updateSpots(data))
        return data;
    }
};
export const deleteSingleReview = (reviewId) => async(dispatch) => {
    const res = await csrfFetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE'
    })
    if(res.ok){
        dispatch(deleteReview(reviewId))
    }
};
const avgRatingMachine = (reviews) => {
    const totalStars = Object.values(reviews).reduce((acc,review) => acc + review.stars, 0 );
    const numReviews = Object.values(reviews).length;
    return totalStars/numReviews;
}




const initialState = {
    currUser: {},
    loadSpots: {},
    currSpot: null,
    reviews: {},
    images: {}
}

const spotReducer = (state= initialState, action) => {
    switch(action.type){
        case LOAD_SPOTS: {
            const newState = {...state, loadSpots: {}}
            action.payload.Spots.forEach(spot => {
                newState.loadSpots[spot.id] = spot;
            })
            return newState;
        }
        case SPOT_DETAILS: {
            return {...state, currSpot: action.payload}
        }
        case LOAD_REVIEWS: {
            const newState = {...state, reviews: {}}
            action.payload.Reviews.forEach(review => {
                newState.reviews[review.id] = review;
            })
            return newState;
        }
        case LOAD_USERS_SPOTS: {
            const newState = {...state, currUser: {}};
            action.payload.Spots.forEach(spot => {
                newState.currUser[spotId] =spot;
            })
            return newState;
        }
        case UPDATE_SPOTS: {
            return {...state, [action.spot.id]: action.spot};
        }
        case DELETE_REVIEW: {
            const reviewId = action.payload;
            const newState = {...state, reviews: {...state.reviews}, currSpot: {...state.currSpot}};
            delete newState.reviews[reviewId];
            delete newState.currSpot[reviewId];
            newState.currSpot.avgStarRating = avgRatingMachine(newState.reviews);
            newState.currSpot.numReviews -= 1;
            return newState;
        }
        case DELETE_SPOT: {
            const spotId = action.payload;
            const newState = {...state, reviews: {...state.reviews}, currSpot: {...state.currSpot}};
            delete newState.loadSpots[spotId];
            delete newState.currUser[spotId];
            return newState;
        }

        default: return state;
    }
}
export default spotReducer;

const selectReviews = state => state.spots.reviews;
export const selectReviewsArray = createSelector(
    [selectReviews],
    (reviews) => Object.values(reviews)
)