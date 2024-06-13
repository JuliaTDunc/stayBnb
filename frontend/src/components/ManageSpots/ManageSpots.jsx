//imports
import { getUserSpots } from "../../store/spots";
import { useSelector, useDispatch } from "react-redux";
import SpotsTile from '../SpotsTile/SpotsTile';
import { useEffect } from "react";
import './ManageSpots.css';


const ManageSpots = () => {
    const sessionUser = useSelector(state => state.session.user);
    const dispatch = useDispatch();
    const spots = useSelector(state => state.spots.currUser);

    const usersSpots = Object.values(spots);

    useEffect(() => {
        dispatch(getUserSpots());
    },[dispatch])

   
return (
    <div className = 'manage-spots-div'>
    <h3>Manage Spots</h3>
    {usersSpots.length === 0 ? (
        <button className='new-user-create-spot'><Link to={'/spots/new'}>Create a New Spot</Link></button>
    ): (<div className='usersSpots-div'>
                {usersSpots
                    .map(spot => (
                        <SpotsTile key={spot.id} spot={spot} />
                    ))}
        </div>
    )}   
    </div>
    )
}
export default ManageSpots;

