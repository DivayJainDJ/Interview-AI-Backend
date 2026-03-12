const {Router}= require('express');
const authController = require('../controllers/auth.controller');
const authRouter = Router();
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post('/register',authController.registerUserController);


/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
authRouter.post('/login',authController.loginUserController);



/**
 * @route GET /api/auth/logout
 * @desc clear token from user cookie and add the token in blacklist
 * @access Public
 **/
authRouter.get('/logout',authController.logoutUserController);

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


authRouter.get('/logout', authController.logoutUserController);

/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access Private
 */
authRouter.get('/get-me', authMiddleware.authUser, authController.getMecontroller);
module.exports = authRouter;