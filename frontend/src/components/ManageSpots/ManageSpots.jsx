//imports
import { getUserSpots } from "../../store/spots";
import { useSelector, useDispatch } from "react-redux";
import SpotsTile from '../SpotsTile/SpotsTile';
import { useEffect } from "react";
import { Link } from "react-router-dom";

import './ManageSpots.css';


const ManageSpots = () => {
    const dispatch = useDispatch();
    const testOne = useSelector(state => state.spots)
    console.log('TEST ONE>>>>',testOne);
    const spots = useSelector(state => state.spots.currUser);
    /*
    CURRENTLY RETURNING: 
    {}[[Prototype]]: Object
*/
    
    /*
    CURRENTLY RETURNING (This is the desired response -- no need to edit):
    {user: {…}}
        user :
        email: "tbaumer@email.com"
        firstName: "Richie"
        id: 8
        lastName: "Tenenbaum"
        username: "TBaumer"
        [[Prototype]]: Object
        [[Prototype]]: Object

    */

    const usersSpots = Object.values(spots);
    console.log('USER SPOTS>>>>', usersSpots)

    /*
    CURRENTLY RETURNING (This user should have one spot, and that spot is not returning):
    []length: 0[[Prototype]]: Array(0)
*/

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

