const TikTokScraper = require('tiktok-scraper');
const instagramUser = require('instagram-user');

async function getInstagramUserEmail(userId, options) {
  const userInfo = await instagramUser(userId)
  return userInfo.email || '';
}

async function getTikTokUserProfileInfo(userId, options) {
  return TikTokScraper.getUserProfileInfo(userId, options);
}

function getTikTokPosts(hashTag, number = 10, options) {
  return TikTokScraper.hashtag(hashTag, {
    number
  })
}

async function getTikTokEmailsByFeed(hashTag, count) {
  try {
    const posts = await getTikTokPosts(hashTag, count)
    const tikUserNames = [...new Set(posts.collector.map(p => p.authorMeta.name))]
    const results = []
    for (const tikUserName of tikUserNames) {
      var tries = 3
      while (tries-- > 0) {
        try {
          const tikUserInfo = await getTikTokUserProfileInfo(tikUserName, {
            //proxy: proxies
          })
          const tikUserUniqueId = tikUserInfo.uniqueId;
          const emailMatch = tikUserInfo.signature.match(/[\s][^\s]+@[^\s]+/) || [''];
          let email = emailMatch[0].trim()
          if (!email) {
            try {
              const instMatch = tikUserInfo.signature.match(/ insta(gram)?:? (?<insta>[^\s\t\n]+)/i);
              const instUserName = instMatch ? instMatch.groups['insta'] || tikUserName : tikUserName
              email = await getInstagramUserEmail(instUserName)
            } catch (e) {
              console.log(e.message || e);
            }
          }
          const result = {
            tiktokUser: tikUserUniqueId,
            email
          }
          results.push(result)
          console.log(result)
          break;
        } catch (err) {
          console.log(err.message || err);
          await new Promise(res => setTimeout(res, 3000))
        }
      }
    }
    return results
  } catch (error) {
    console.log(error);
    return error
  }
}


module.exports = async function(req, res, next) {
  const { hashtag, count } = req.query
  if(!hashtag)
    return res.json('invalid query')
  else {
    const results = await getTikTokEmailsByFeed(hashtag, count || 10)
    return res.json(results);
  }
}

