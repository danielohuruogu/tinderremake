import React, { useEffect } from 'react'
import axios from 'axios';

import Chat from './Chat'
import ChatInput from './ChatInput'

const ChatDisplay = (props) => {
    const {user, clickedUser } = props;

    const [userMessages, setUserMessages] = React.useState(null);
    const [clickedUserMessages, setClickedUserMessages] = React.useState(null);

    const userId = user?.user_id;
    const clickedUserId = clickedUser?.user_id;

    // grab any messages associated with my userId
    const getUserMessages = async () => {
        try {
            const response = await axios.get('http://localhost:8000/messages', {
                params: {userId: userId, correspondingUserId: clickedUserId}
            })
            setUserMessages(response.data);
        } catch(err) {
            console.log(err);
        }
    }

    const getClickedUserMessages = async () => {
        try {
            const response = await axios.get('http://localhost:8000/messages', {
                params: {userId: clickedUserId, correspondingUserId: userId }
            })
            setClickedUserMessages(response.data);
        } catch(err) {
            console.log(err);
        }
    }

    useEffect(() => {
        getUserMessages();
        getClickedUserMessages();
    }, [
        // clickedUserMessages
    ]);

    const messages = []

    userMessages?.forEach(message => {
        const formattedMessage = {}
        formattedMessage['name'] = user?.first_name;
        formattedMessage['image'] = user?.url;
        formattedMessage['message'] = message.message;
        formattedMessage['timestamp'] = message.timestamp;
        messages.push(formattedMessage);
    });

    clickedUserMessages?.forEach(message => {
        const formattedMessage = {}
        formattedMessage['name'] = clickedUser?.first_name;
        formattedMessage['image'] = clickedUser?.url;
        formattedMessage['message'] = message.message;
        formattedMessage['timestamp'] = message.timestamp;
        messages.push(formattedMessage);
    });

    const descendingOrderMessages = messages?.sort((a,b) => a.timestamp.localeCompare(b.timestamp))

    return (
        <>
            <Chat descOrdMessages={descendingOrderMessages}/>
            <ChatInput
                user={user}
                clickedUser={clickedUser}
                getUserMessages={getUserMessages}
                getClickedUserMessages={getClickedUserMessages}
            />
        </>
    )
}

export default ChatDisplay