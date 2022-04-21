import React from 'react'

const ChatInput = () => {
    const [textarea, setTextArea] = React.useState(null)

    return (
        <div className="chat-input">
            <textarea
                value={textarea}
                onChange={(e) => {setTextArea(e.target.value)}}
                />
            <button className="secondary-button">Submit</button>
        </div>
    )
}

export default ChatInput