import { useSelector} from "react-redux";
import ProfileButton from './ProfileButton';
import { Link } from "react-router-dom";
import './Navigation.css';


function Navigation({isLoaded}) {
    const sessionUser = useSelector((state)=>state.session.user);
    return (
        <div className='nav-bar'>
            <Link to='/'><img src='./stayBnbFirstLogo.png' alt='stayBnblogo' className='logo'></img></Link>
            {isLoaded && (
                <div>
                    {sessionUser ? (<Link to='/spots/new' className="new-spot-link">Create a New Spot</Link>) : ("")}
                    <ProfileButton user={sessionUser} />
                </div>
            )}
        </div>
    )
}
export default Navigation;