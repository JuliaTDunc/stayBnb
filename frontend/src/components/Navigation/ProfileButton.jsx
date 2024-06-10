import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { FaUserCircle } from 'react-icons/fa';
import { LiaBarsSolid } from "react-icons/lia";
import * as sessionActions from '../../store/session';
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import LoginFormModal from '../LoginFormModal/LoginFormModal';
import SignupFormModal from "../SignupPage/SignupFormModal";
import './ProfileButton.css';

import { useNavigate } from "react-router-dom";

function ProfileButton({ user }) {
    const dispatch = useDispatch();
    const [showMenu, setShowMenu] = useState(false);
    const ulRef = useRef();

    const navigate = useNavigate();

    const toggleMenu = (e) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    useEffect(() => {
        if (!showMenu) return;

        const closeMenu = (e) => {
            if (!ulRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('click', closeMenu);

        return () => document.removeEventListener('click', closeMenu);
    }, [showMenu]);

    const closeMenu = () => setShowMenu(false);
    const logout = (e) => {
        e.preventDefault();
        dispatch(sessionActions.logout());
        closeMenu();
        navigate('/');
    };

    const ulClassName = 'profile-dropdown' + (showMenu ? '' : ' hidden');
    return (
        <>
            <button className="profile-button" onClick={toggleMenu}>
                <FaUserCircle />
                <LiaBarsSolid />
            </button>
                  <div className={ulClassName} ref={ulRef}>
                {user ? (
                    <div className='profile-details'>
                        <span>Hello, {user.firstName}!</span>
                        <br/>
                        <span>{user.email}</span>
                        <br/>
                        <button onClick={logout} className="log-out-button">Log Out</button>
                    </div>
                ) : (
                    <div className='open-mod-buttons'>
                        <OpenModalButton
                            buttonText="Log In"
                            onButtonClick={closeMenu}
                            modalComponent={<LoginFormModal />}
                        />
                        <OpenModalButton
                            buttonText="Sign Up"
                            onButtonClick={closeMenu}
                            modalComponent={<SignupFormModal />}
                        />
                    </div>
                )}
            </div>
        </>
    );
}

export default ProfileButton;
