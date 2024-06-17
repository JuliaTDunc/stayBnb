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
    const [disableLoginButton, setDisableLoginButton]= useState(true);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const { closeModal } = useModal();

    const handleChange = (setField, field) => (e) => {
        setField(e.target.value);
        if(errors[field]){
            setErrors((prevErr) => {
                const newErr = {...prevErr};
                delete newErr[field];
                return newErr;
            })
        }
    }
    useEffect(() => {
        setDisableLoginButton(credential.length >= 4 && password.length >= 6);
    }, [credential, password])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setHasSubmitted(true);
        try{
         dispatch(sessionActions.login({ credential, password }))
            closeModal();
        } catch(res) {
                const data = await res.json();
                if (data && data.errors) {
                    setErrors(data.errors);
                }
                else{
                    setErrors({credential: 'The provided credentials were invalid'})
                }
            }
        }
    const handleDemo = async(e) => {
        e.preventDefault();
        try{
         dispatch(sessionActions.login({credential:'demo@email.com', password:'password123'}));
         closeModal();
        } catch(res){
            const data = await res.json();
            if(data && data.errors){
                setErrors(data.errors)
            } else {
                setErrors({credential:'The provided credentials were invalid.'})
            }
        }
    }

    return (
        <>
            <h1>Log In</h1>
            <form onSubmit={handleSubmit}>
                {hasSubmitted && errors.credential && (<p>{errors.credential}</p>)}
                    <input
                        type="text"
                        placeholder='Username or Email'
                        value={credential}
                        onChange={handleChange(setCredential, 'credential')}
                        required
                    />
               
                    Password
                    <input
                        type="password"
                        placeholder='Password'
                        value={password}
                        onChange={handleChange(setPassword, 'password')}
                        required
                    />
            
                <button type="submit" disabled={disableLoginButton}>Log In</button>
                <h3 onClick={handleDemo} className='demo-user'>Demo User</h3>
            </form>
        </>
    );
}


export default LoginFormModal;
