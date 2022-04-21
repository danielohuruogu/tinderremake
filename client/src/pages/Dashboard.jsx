import React, { useEffect } from 'react'
import TinderCard from 'react-tinder-card'
import ChatContainer from '../components/ChatContainer'
import axios from 'axios';
import { useCookies } from 'react-cookie';

const Dashboard = () => {
    const [user, setUser] = React.useState(null);
    const [genderedUsers, setGenderedUsers] = React.useState(null);
    const [cookies, setCookie, removeCookie] = useCookies(['users']);
    const [lastDirection, setLastDirection] = React.useState()

    const userId = cookies.UserId;

    const getUser = async () => {
        try
        {   // response to the backend to grab a single user,
            const response = await axios.get('http://localhost:8000/user', {
              // sending in the user id saved in the cookie as the query
                params: { userId }
            });
            // the data that comes back is saved in a state
            setUser(response.data);
        } catch(err) {
            console.log(err);
        }
    }

    const getGenderedUsers = async () => {
        try
        {
            const response = await axios.get('http://localhost:8000/gendered-users', {
                params: { gender: user?.gender_interest }
            });
            setGenderedUsers(response.data);

        } catch(err) {
            console.log(err);
        }
    }

    const updateMatches = async (matchedUserId) => {
        try
        {
            // add a match if someone swipes right on a person
            await axios.put('http://localhost:8000/addmatch', {
                // passing through user id
                userId,
                // and the id of the swiped person
                matchedUserId
            });
            // getUser again to refresh the people that have been matched with the user
            getUser();
        } catch(err) {
            console.log(err);
        }
    }

    // useEffect to get a new user's data to the dashboard if the cookie changes
    useEffect(() => {
        getUser();
    }, []);

    useEffect(()=> {
        if (user)
        getGenderedUsers();
    }, [user])

    const swiped = (direction, swipedUserId) => {
      
        if (direction === 'right')
        {
            updateMatches(swipedUserId);
        }
        setLastDirection(direction)
    }

    const outOfFrame = (name) => {
      console.log(name + ' left the screen!')
    }

    // will provide an array of user ids that the logged in user has matched with,
    // with the logged in user's id tagged on to the end
    const matchedUserIds = user?.matches.map(({ user_id }) => user_id).concat(userId);

    // filter the matches so that previously matched users don't show up again
    const filteredMatches = genderedUsers?.filter((genderedUser) => {
        return !matchedUserIds.includes(genderedUser.user_id);
    });

    return (
        <>
        { (user && genderedUsers ) && 
            <div className="dashboard">
                <ChatContainer
                    user={user}
                />
                <div className="swipe-container">
                    <div className="card-container">
                        {filteredMatches.map((user_interest) =>
                            <TinderCard
                                className='swipe'
                                key={user_interest.user_id}
                                onSwipe={(dir) => swiped(dir, user_interest.user_id)}
                                onCardLeftScreen={() => outOfFrame(user_interest.first_name)}
                                >
                                <div style={{ backgroundImage: 'url(' + user_interest.url + ')' }} className='card'>
                                    <h3>{user_interest.first_name}</h3>
                                </div>
                            </TinderCard>
                        )}
                        <div className="swipe-info">
                            {lastDirection ? <p>You swiped {lastDirection}</p> : <p></p>}
                        </div>
                    </div>
                </div>
            </div>
        }
        </>
    )
}

export default Dashboard