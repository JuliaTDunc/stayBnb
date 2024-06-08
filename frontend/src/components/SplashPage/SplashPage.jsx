import {useDispatch, useSelector} from 'react-redux';
import { useEffect } from 'react';
import { getSpots } from '../../store/spots';
import SpotsTile from '../SpotsTile/SpotsTile';
import './SplashPage.css';

const SplashPage = () => {
    const dispatch = useDispatch();
    const spots = useSelector(state => state.spots.loadSpots);
    useEffect(() => {
        dispatch(getSpots())
    },[dispatch]);
    return (
        <div className='spots-container'>
            {Object.values(spots).map((spot) => (
                <SpotsTile key={spot.id} spot={spot} />
            ))}
        </div>
    )
};

export default SplashPage;
