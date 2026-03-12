const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true,"token is required to be added in blacklist"],
    },
    },{
    timestamp:true 
    });

const tokenBlacklistModel = mongoose.model('BlacklistTokens', blacklistSchema);


module.exports = tokenBlacklistModel;