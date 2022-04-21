import React from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useCookies } from 'react-cookie'


const AuthModal = (props) => {
    const { setShowModal, isSignUp } = props;

    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ confirmPassword, setConfirmPassword ] = useState("");
    const [ error, setError ] = useState(null);
    const [cookies, setCookie, removeCookie] = useCookies(['user']);

    let navigate = useNavigate()

    // console.log(email, password, confirmPassword);
    // console.log(isSignUp);

    const handleClick = () => {
        setShowModal(false);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try
        {
            if (isSignUp && (password !== confirmPassword))
            {
                setError("Passwords need to match");
                return
            }
            
            const response = await axios.post(`http://localhost:8000/${ isSignUp ? 'signup' : 'login'}`, { email, password });
            
            // set cookies using the response data chucked out, as defined on the backend
            setCookie('AuthToken', response.data.token);
            setCookie('UserId', response.data.userId);

            const success = response.status === 201;

            if (success && isSignUp) navigate('/onboarding');
            if (success && !isSignUp) navigate('/dashboard');

            window.location.reload();

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="auth-modal">
            <div className="close-icon"
                onClick={handleClick}
            >
                ⊗
            </div>
            <h2>{isSignUp ? "Create account" : "Log In"}</h2>
            <p>By clicking Log In, you agree to our terms. Learn how we process your data in our Privary Policy and Cookie Policy</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Email"
                    required={true}
                    onChange={(e)=> setEmail(e.target.value)}
                    />
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Password"
                    required={true}
                    onChange={(e)=> setPassword(e.target.value)}
                    />
                {isSignUp && (<input
                    type="password"
                    id="password-check"
                    name="password-check"
                    placeholder="Confirm password"
                    required={true}
                    onChange={(e)=> setConfirmPassword(e.target.value)}
                    />
                )}
                <input className="secondary-button" type="submit"/>
                <p>{error}</p>
            </form>
            <hr/>
            <h2>GET THE APP</h2>
        </div>
    )
}

export default AuthModal