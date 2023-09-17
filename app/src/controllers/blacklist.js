const { Blacklist } = require('../models/blacklist')

async function checkBlacklisted(accessToken) {
    const blacked = await Blacklist.findOne({token: accessToken})
    return blacked;
};

async function createBlackList(accessToken) {
    const blacklist = new Blacklist({
        token: accessToken
    })

    try {
      const result = await blacklist.save();
      return result;
    } catch (ex) {
      for (field in ex.errors) return(ex.errors[field].message);
    }
}

module.exports = { 
    checkBlacklisted,
    createBlackList
}