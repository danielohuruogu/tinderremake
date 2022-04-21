import React from 'react'
import ChatHeader from './ChatHeader'
import MatchesDisplay from './MatchesDisplay'
import ChatDisplay from './ChatDisplay'

const ChatContainer = (props) => {
    const { user } = props;
    // setting the state for whether a match has been clicked
    const [clickedUser, setClickedUser] = React.useState(null);

    return (
        <div className="chat-container">
            
            <ChatHeader
                user={user}
            />
            <div>
                {/* if the matches header gets clicked, there is no user currently being clicked - set to null */}
                <button className="option" onClick={() => setClickedUser(null)}>Matches</button>
                {/* if there is a user currently clicked on, disable this option */}
                <button className="option" disabled={!clickedUser}>Chat</button>
            </div>

            {/* if a user is presently clicked, show the chat display */}
            {clickedUser ?
                <ChatDisplay
                    user={user}
                    clickedUser={clickedUser}
                />
                :
            // if not, show the matches display, to be able to click a user
                <MatchesDisplay
                    matches={user.matches}
                    setClickedUser={setClickedUser}
                />
            }
        </div>
    )
}

export default ChatContainer