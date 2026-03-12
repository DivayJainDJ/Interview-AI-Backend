const userModel = require('../models/user.model');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model'); 

/**
 * @name registerUserController
 * @description Controller function to handle user registration. It receives the user data from the request body, validates it, and creates a new user in the database. If the registration is successful, it returns a success message; otherwise, it returns an error message.
 * @access Public
 */

async function registerUserController(req, res) {
    const { username, email, password } = req.body;



    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }



    const isUserAlreadyExists = await userModel.findOne({ $or: [{ username }, { email }] }); 

    if (isUserAlreadyExists) {
        return res.status(400).json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
        username,
        email,
        password: hashedPassword,
    });

    const savedUser = await user.save();
    
    const token= jwt.sign(
        { id: savedUser._id, username:user.username }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' });

    

    res.cookie("token", token);
    res.status(201).json({ 
        message: "User registered successfully", 
        user:{
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email,
        }
     });

}



/**
 * @name loginUserController
 * @description Controller function to handle user login. It receives the user credentials from the request body, validates them against the database, and if the credentials are valid, it generates a JWT token and returns it in the response. If the credentials are invalid, it returns an error message.
 * @access Public
 */
async function loginUserController(req, res) {
    // Implementation for user login
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    res.cookie("token", token);
    res.status(200).json({ 
        message: "User logged in successfully", 
        user:{
            id: user._id,
            username: user.username,
            email: user.email,
        },
     });
}



/**
 * @name logoutUserController
 * @description Controller function to handle user logout. It receives the JWT token from the user's cookies, adds it to a blacklist to prevent future use, and clears the token cookie from the user's browser. If the logout is successful, it returns a success message; otherwise, it returns an error message. 
 * @access Public
 */

async function logoutUserController(req, res) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(400).json({ message: "No token provided" });
    }

    // Add the token to the blacklist
    await tokenBlacklistModel.create({ token });

    // Clear the token cookie 
    res.clearCookie("token");
    res.status(200).json({ message: "User logged out successfully" });
}


/**
    * @name getMecontroller
    * @description get the current logged in user details
    * @access Private
*/

async function getMecontroller(req, res) {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
        message: "User details retrieved successfully", 
        user:{
            id: user._id,
            username: user.username,
            email: user.email,
        },
     });
}

module.exports={registerUserController,loginUserController,logoutUserController,getMecontroller}; 
