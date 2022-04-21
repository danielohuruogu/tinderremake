import logo from '../images/white tinder logo.png';
import colourLogo from '../images/color tinder logo.png';
import React from 'react'

const Nav = (props) => {

    const { showModal, setShowModal, minimal, setIsSignUp } = props;

    const handleClick = () => {
        setShowModal(true);
        setIsSignUp(false);
    }

    const authToken = false;
    
    return (
        <nav>
            <div className="logo-container">
                <img className="logo" src={minimal ? colourLogo : logo}/>
            </div>
            {(!authToken && !minimal) && (
            <button
                className='nav-button'
                onClick={handleClick}
                disabled={showModal}
                >
                    Log in
                </button>
            )}
        </nav>
    )
}

export default Nav