'use strict';

const connect = require('connect');
const query = require('connect-query');
const getTikTokEmailsByFeed = require('./getTikTokEmails');

const app = connect();
const { PORT, NODE_ENV } = process.env;
app.use(query())

app.use(function(req, res, next) {
  res.json = function(obj) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    return res.end(JSON.stringify(obj))
  }
  next()
})

app.use(function(err, req, res, next) {
  res.json({
    message: err.message
  });
  next();
});

app.use('/', async function(req, res, next) {
  const { hashtag, count } = req.query
  if(!hashtag)
    return res.json('invalid query')
  else {
    const results = await getTikTokEmailsByFeed(hashtag, count || 10)
    return res.json(results);
  }
});

app.listen(PORT || 3000);