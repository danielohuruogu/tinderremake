import React from 'react'

const Chat = (props) => {
    const { descOrdMessages } = props;
    console.log('chat history is ' ,descOrdMessages);

    return (
        <div className="chat-display">
            {descOrdMessages.map((message, _index) => (
                <div key={_index}>
                    <div className="chat-message-header">
                        <div className="img-container">
                            <img src={message.image} alt={message.first_name + "'s profile"}/>
                        </div>
                        <p>{message.name}</p>
                    </div>
                    <p>{message.message}</p>
                </div>
            ))}
        </div>
    )
}

export default Chat