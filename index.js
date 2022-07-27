const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const session = require('express-session')
const passwordless = require('passwordless')
const MemoryStore = require('passwordless-memorystore')
const bodyParser = require('body-parser')

const users = [
  { id: 1, email: 'test@aa.com' },
  { id: 2, email: 'test2@aa.com' }
]

// Session
app.use(session({ secret: 'hoge', resave: false, saveUninitialized: true }))
app.use(bodyParser.urlencoded({ extended: false }))

passwordless.init(new MemoryStore())
passwordless.addDelivery(function (
  tokenToSend,
  uidToSend,
  recipient,
  callback
) {
  console.log(
    'Access the account here:\n' +
      'http://localhost:3000/' +
      '?token=' +
      tokenToSend +
      '&uid=' +
      encodeURIComponent(uidToSend)
  )
  callback()
})
app.use(passwordless.sessionSupport())
app.use(passwordless.acceptToken({ successRedirect: '/' }))

app.get('/', function (req, res) {
  var userString = ''
  if (req.user) {
    userString =
      '<p><a href="/logout">Hi, ' + findUserById(req.user).email + '</a></p>'
  }

  res.send(
    '<html>                                            \
              <body>                                          \
                  <h1>Passwordless Demo</h1>' +
      userString +
      '<h2>Login</h2>                             \
                  <form action="/sendtoken" method="POST">    \
                      Email:                                  \
                      <br><input name="user" type="text">     \
                      <br><input type="submit" value="Login"> \
                  </form>                                     \
              </body>                                         \
          </html>'
  )
})
app.post(
  '/sendtoken',
  passwordless.requestToken(function (user, delivery, callback) {
    var currentUser = findUserByEmail(user)
    callback(null, currentUser ? currentUser.id : null)
  }),
  function (req, res) {
    res.send(
      'Sent - The token link has been sent to your server \
                    console. In practice, you would send it via email or text message!'
    )
  }
)

app.get('/logout', passwordless.logout(), function (req, res) {
  res.redirect('/')
})

function findUserByEmail(email) {
  for (var i = users.length - 1; i >= 0; i--) {
    if (users[i].email === email.toLowerCase()) {
      return users[i]
    }
  }
  return null
}

// Find a user by its ID
function findUserById(id) {
  for (var i = users.length - 1; i >= 0; i--) {
    if (users[i].id === parseInt(id, 10)) {
      return users[i]
    }
  }
  return null
}

app.listen(port, function () {
  console.log(`listening on port ${port}`)
})
