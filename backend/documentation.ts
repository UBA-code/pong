// ? this is a documentation file, for end points and their descriptions

// ! email/password signup endpoints
// ? endpoint: /auth/signup
// description: returns a token if the user is authenticated
// method: POST
// auth: not required
// body:
// {
//   "username": "username",
//   "email": "username@mail.com",
//   "password": "usernamepassword"
// }

// ! email/password signin endpoints
// ? endpoint: /auth/signin
// description: returns a token if the user is authenticated
// method: POST
// auth: not required
// body:
// {
//   "username": "username",
//   "password": "usernamepassword"
// }

// ! intra auth endpoints
// ? endpoint: /auth/intra
// description: returns a token if the user is authenticated
// method: GET
// auth: not required

// ! google auth endpoints
// ? endpoint: /auth/google
// description: returns a token if the user is authenticated
// method: GET
// auth: not required

// ! 2fa
// ? endpoint: /auth/2fa/status
// description: returns the 2fa status of the user either enabled or not enabled
// method: GET
// auth: required

// ? endpoint: /auth/2fa/enable
// description: enables 2fa for the user and returns the qr code image
// method: GET

// ? endpoint: /auth/2fa/disable
// description: disables 2fa for the user
// method: GET

// ? endpoint: /auth/2fa/verify
// description: verifies the 2fa code of the user it returns success if the code is correct and error if it's not
// method: POST
// body:
// {
//     "token": "token entered by the user"
// }

// ! profile endpoints
// ? endpoint: /user/matches/history/:username?x=3
// description: returns last x matches of the user, x can be any number
// method: GET
// auth: required

// ? endpoint: /user/matches/longeststreak/:username
// description: returns the longest streaks of the user
// method: GET
// auth: required

// ? endpoint: /user/matches/winrate/:username
// description: returns the winrate of the user
// method: GET
// auth: required

// ? endpoint: user/matches/lastmatch/:username
// description: returns the last match of the user with the last opponent and some other infos
// method: GET
// auth: required

// ? endpoint: /user/leaderboard/top?x=3
// description: returns the leaderboard of first x users, x can be any number
//              (each user has a score, the more he wins the more his score increases by 3,
//              the more he loses the more his score decreases by 3)
// method: GET

// ? endpoint: /auth/whoami
// description: returns the user info (username, email, avatar, etc...)
// method: GET

// ? endpoint: /auth/whoami?username=hmida
// description: returns the user info of hmida (username, email, avatar, etc...)
// method: GET

// ! friends endpointsc
// ? endpoint: /user/friendships/:id
// description: returns the friends of the user
// method: GET

// ? endpoint: /user/is-friend/:username/:friendUsername
// description: returns if the user is a friend of another user
// method: GET

// ? endpoint: /user/friendship/:username/:friendUsername
// description: returns the friendship between the user and another user
// method: GET

// ? endpoint: /user/friendships/:id/add/:friendId?byUsername=true
// description: adds a friend to the user (byUsername is optional, if it's true the id and friendId will be treated as usernames)
// method: GET

// ? endpoint: /user/friendships/:id/accept/:friendId?byUsername=true
// description: accepts a friend request (byUsername is optional, if it's true the id and friendId will be treated as usernames)
// method: GET

// ? endpoint: /user/friendships/:id/remove/:friendId?byUsername=true
// description: removes a friend from the user (byUsername is optional, if it's true the id and friendId will be treated as usernames)
// method: GET

// ? endpoint: friendships/:id/block/:friendId
// description: block the user with friendId
// method: GET

// ? endpoint: friendships/:id/unblock/:friendId
// description: block the user with friendId
// method: GET

// ? endpoint: /user/waiting/approuval
// description: returns the waiting friend requests for the userId provided
// method: GET

// ? endpoint: /user/sent/requests
// description: returns the sent friend requests for the userId provided
// method: GET

// ! chat endpoints
// ? endpoint: /chat/dm/:id1/:id2/:start_pos
// description: returns the chat history between the user and another user
// method: GET

// ? endpoint: /chat/dm/:id1/:id2?message=hello
// description: sends a message to another user (requires the message in the params)
// method: POST

// ? endpoint: /chat/reset/:id1/:id2
// description: resets the chat history between the user and another user
// method: GET

// ! channels endpoints
// ? endpoint: /chat/channels/create
// description: creates a channel (requires a name and a type (public or private) and a password if the channel is private in the body)

// {
//     name: "channel name",
//     type: "public",
//     password: "password" // if the channel is private
//     createdBy: 1 // the user id
// }
// method: POST

// ? endpoint: /chat/channels/:id
// description: returns the info of a channel (name, type, users, admins)
// method: GET

// ? endpoint: /chat/channels/:id/add/:userId
// description: add a user to a channel
// method: GET

// ? endpoint: /chat/channels/:id/remove/:userId
// description: remove a user from a channel
// method: GET

// ? endpoint: /chat/channels/:id/kick/:userId
// description: kick a user from a channel
// method: GET

// ? endpoint: /chat/channels/:id/owner/:userId
// description: change the owner of a channel
// method: GET

// ? endpoint: /user/joined-channels/:id
// description: returns the channels of the user with their infos (name, type) (id is the user id)
// method: GET

// ? endpoint: /user/non-joined-channels/:id
// description: returns the channels that the user is not joined with their infos (name, type)
// method: GET

// ? endpoint: /chat/channels/:id1/:id2?message=hello
// description: send a message to a channel
// method: POST

// ? endpoint: /chat/channels/:id/messages/:index
// description: returns the messages of a channel
// method: GET

// ? endpoint: /chat/channels/:id/messages/:username
// description: returns the messages of a channel without the messages of blocked users / and channel without the messages of the users who blocked me also
// method: GET

// ! channels admin endpoints

// ? endpoint: /chat/channels/:id/add-admin/:userId?adminId=1
// description: add an admin to a channel
// method: GET

// ? endpoint: /chat/channels/:id/remove-admin/:userId?adminId=1
// description: remove an admin from a channel
// method: GET

// ? endpoint: /chat/channels/:id/ban/:userId?adminId=1
// description: ban a user from a channel
// method: GET

// ? endpoint: /chat/channels/:id/unban/:userId?adminId=1
// description: unban a user from a channel
// method: GET

// ? endpoint: /chat/channels/:id/mute/:userId?adminId=1&time=5
// description: mute a user from a channel for a certain time (time is in seconds) if the time is -1 the user will be muted forever
// method: GET

// ? endpoint: /chat/channels/:id/unmute/:userId?adminId=1
// description: unmute a user from a channel
// method: GET

// ? endpoint: /chat/channels/:id/delete?adminId=1
// description: delete a channel
// method: GET

// ! seen endpoint
// ? endpoint: /chat/seen/:userId/:senderId
// description: updates the seen status of the messages between the user and another user so if this endpoint is called the messages will be marked as seen
// method: GET

// ! user update username endpoint
// ? endpoint: /user/:username/update/username
// description: updates the username of the user
// method: POST
// body:
// {
//     username: "newusername"
// }

// ! blocked users endpoint
// ? endpoint: /user/blocked
// description: get the blocked users
// method: GET

// ! search users endpoint
// ? endpoint: /user/search/:usernameOftheConnecterUser?search=searchedUsername
// description: returns the users that have the username in their username
// method: GET

// ! user update avatar endpoint
// ? endpoint: /user/:username/upload/avatar
// description: updates the avatar of the user
// method: POST
// check the file in the root folder avatar.html for more info

// ? endpoint: /user/update/infos
// description: updates the user info of the logged in user
// method: POST

// ? endpoint: /user/exist?username=x
// description: return either true or false if username exists
// method: POST
