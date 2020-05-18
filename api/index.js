const getTikTokEmailsByFeed = require('../getTikTokEmails');

module.exports = async function(req, res, next) {
  const { hashtag, count } = req.query
  if(!hashtag)
    return res.json('invalid query')
  else {
    const results = await getTikTokEmailsByFeed(hashtag, count || 10)
    return res.json(results);
  }
}