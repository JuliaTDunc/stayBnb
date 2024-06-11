//imports
import { getSpots } from "../../store/spots";
import { useSelector, useDispatch } from "react-redux";
import SpotsTile from '../SpotsTile/SpotsTile';
import { useEffect } from "react";


const ManageSpots = () => {
    const sessionUser = useSelector(state => state.session.user);
    const dispatch = useDispatch();
    const spots = useSelector(state => state.spots.loadSpots)
    let spotsArr = Object.values(spots)
    useEffect(() => {
        dispatch(getSpots());
    },[dispatch])
    const currSpots = spotsArr.filter(spot => spot.ownerId === sessionUser.id)
   
return (
        <div className='manage-spots-div'>
           {currSpots
           .map(spot=> (
            <SpotsTile key={spot.id} spot={spot}/>
           ))}
        </div>
    )
}
export default ManageSpots;

