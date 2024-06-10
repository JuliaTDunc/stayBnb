import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import './SpotsTile.css'

const SpotsTile = ({spot}) => {
    return (
        <Link key={spot.id} to={`/spots/${spot.id}`} title={spot.name}>
            <div className='spot-tile'>
                <img src={spot.previewImage} alt={spot.name} className='spot-image'/>
                <div className='spot-tile-details'>
                    <div>
                        <p>{spot.city},{spot.state}</p>
                        {spot.avgRating ? (
                            <p className='c-stars'><FaStar/>{(spot.avgRating.toFixed(1))}</p>
                        ): ('Message-SpotTile.jsx')}
                    </div>
                    <p>{spot.price} /night</p>
                </div>
            </div>
        </Link>
    )
}

export default SpotsTile;