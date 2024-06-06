import { useState, useEffect } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginForm.css';

function LoginFormModal() {
    const dispatch = useDispatch();
    const [credential, setCredential] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const { closeModal } = useModal();
    const [isFormValid, setIsFormValid] = useState('false');

    useEffect(() => {
        setIsFormValid(credential.length >= 4 && password.length >= 6);
    }, [credential, password])

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        return dispatch(sessionActions.login({ credential, password }))
            .then(closeModal)
            .catch(async (res) => {
                const data = await res.json();
                if (data && data.errors) {
                    setErrors(data.errors);
                }
            });
    };
    const handleDemo = () => {
        return dispatch(sessionActions.login({credential:'demo', password:'password'}))
        .then(closeModal)
    }

    return (
        <>
            <h1>Log In</h1>
            <form onSubmit={handleSubmit}>
                
                    <input
                        type="text"
                        placeholder='Username or Email'
                        value={credential}
                        onChange={(e) => setCredential(e.target.value)}
                        required
                    />
               
                    Password
                    <input
                        type="password"
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                
                {errors.credential && (
                    <p className='error'>{errors.credential}</p>
                )}
                <button type="submit" disabled={!isFormValid}>Log In</button>
                <h3 onClick={handleDemo} className='demo-user'>Demo User</h3>
            </form>
        </>
    );
}

export default LoginFormModal;
