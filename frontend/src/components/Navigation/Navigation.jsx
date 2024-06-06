import { NavLink } from "react-router-dom";
import { useSelector} from "react-redux";
import ProfileButton from './ProfileButton';
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import SignupFormModal from "../SignupPage/SignupFormModal";
import './Navigation.css';

function Navigation({isLoaded}) {
    const sessionUser = useSelector((state)=>state.session.user);

    let sessionLinks;

    if(sessionUser){ 
        sessionLinks =  (
        <li>
            <ProfileButton user={sessionUser}
            userFirst={sessionUser.firstName} />
        </li>
        );
        } else {
        sessionLinks = (
            <>
        <li>
            <OpenModalButton
           
            buttonText='Log In'
            modalComponent={<LoginFormModal/>}
            />
        </li>
        <li>
            <OpenModalButton
       
            buttonText='Sign Up'
            modalComponent={<SignupFormModal/>}
            />
        </li>
        </>
        )
}

    return (
    <ul>
        <li style={{textAlign: 'left'}}>
            <NavLink to="/">StayBnb</NavLink>
        </li>
        {isLoaded && sessionLinks}
    </ul>
    )
}
export default Navigation;