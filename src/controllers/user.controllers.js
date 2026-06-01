/*
Get Data: Extract fullname, email, uname, and password from req.body.

Validate: Write an if statement. If any of those 4 fields are empty, return a 400 error.

Check Database: Use User.findOne() to see if a user with that email or uname already exists. If yes, return a 409 (Conflict) error.

Catch the File: Check req.files. If the user didn't upload an avatar, throw an error. Extract the local file path (where Multer temporarily saved it).

Upload to Cloud: Call your uploadOnCloudinary(avatarLocalPath) function.

Save to DB: Use User.create() to save the user. (Remember: your Model hook will automatically hash the password here!)

Clean the Response: Fetch the newly created user from the DB using their ID, but use .select("-password") so you don't send the password back to the frontend.

Send Success: Return a 201 status with a JSON message saying "User registered!".
*/

import asynchandler from "../utils/asynchandler.js"
import Apiresolve from "../utils/Apiresolved.js"
import apireject  from "../utils/Apireject.js"



