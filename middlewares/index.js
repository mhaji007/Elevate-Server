 /*
Protected route
A protected page that restrict only to logged in user
with valid token. In order to verify if token is valid, we
need to send a request to backend (browser will include token
in hheaders automatically). If authentication is successful
the protected page is displayed to the user


*/

import expressJwt from "express-jwt";

// jwt-express will check for valid token in header
// if token is valid req.user is returned
// where we can access ._id via req.user._id
export const requireSignin = expressJwt({
  getToken:(req, res) => req.cookies.token,
  secret: process.env.JWT_SECRET,
  algorithms:["HS256"]
})


