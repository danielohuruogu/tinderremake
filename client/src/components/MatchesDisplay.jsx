import React from 'react'
import axios from 'axios'
import { useCookies } from 'react-cookie';

const MatchesDisplay = (props) => {
    const { matches, setClickedUser } = props;

    const [matchedProfiles, setMatchedProfiles] = React.useState(null);
    const [cookies, setCookie, removeCookie] = useCookies(['user']);

    // getting all the user ids that I've matched with
    const matchedUserIds = matches.map(( {user_id} ) => user_id);

    // grabbing logged in user's id from cookies
    const userId = cookies.UserId;

    const getMatches = async () => {
        try {
            // send through an array of user ids to grab from the DB
            const response = await axios.get('http://localhost:8000/users', {
                params: {userIds: JSON.stringify(matchedUserIds)}
            });
            setMatchedProfiles(response.data)
        } catch(err) {
            console.log(err);
        }
    }

    React.useEffect(() => {
        getMatches();
    }, [matches])

    // a function to filter out those users that have the logged in user as a match
    // go into matched profiles
    // find matches in matched profiles
    // only returns one with logged in user in matches
    const filteredMatchedProfiles = matchedProfiles?.filter(
        matchedProfile => matchedProfile.matches.filter((profile) => profile.user_id == userId).length > 0
    )

    return (
        <div className="matches-display">
            {filteredMatchedProfiles?.map((match) => (
                <div key={match.user_id} className="match-card" onClick={() => setClickedUser(match)}>
                    <div className="img-container">
                        <img src={match?.url} alt={match?.first_name + "'s profile"}/>
                    </div>
                    <h3>{match?.first_name}</h3>
                </div>
            ))}
            
        </div>
    )
}

export default MatchesDisplay