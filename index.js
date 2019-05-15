const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

let app = express()
app.set('port', process.env.PORT || 3000)
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

// store recently sent messages in memory so we dont send multiple messages
// to the same user when slack sends multiple webhooks
let recentlySentMessages = []

app.post('/', async function (req, res) {
  const payload = req.body
  if (payload.challenge) {
    res.send(req.body.challenge) // on install only
  }
  console.log('got hook')
  if (payload.event.type === 'member_joined_channel' && 
      payload.event.channel === process.env.OPS_CHANNEL &&
      !recentlySentMessages.includes(payload.event.user)) {
    console.log('sending slack msg')
    console.log(process.env.SLACK_BOT_TOKEN)
    request({
      method: 'post',
      body: {
        channel: process.env.OPS_CHANNEL,
        user: payload.event.user,
        text: '',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: ':wave: *Welcome to #gn-get-stuff-done!*'
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `I'm Ono, the Operations Ninja Owl! I'm here to give you an overview of this channel so that everyone gets the most value from it! This is a place where people get together to share and learn from experiences in the realm of operations, project management, and other ways we Get Stuff Done!`
            }
          },
          {
            type: 'divider'
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Guidelines for participating in this channel* \n:point_up: Be inclusive, kind, and welcoming - encourage people to ask questions! Let's make this a safe place to share & learn together \n:v: Thread conversations - this will help keep the channel neat & tidy \n:ok_hand: Avoid using \`@here\` and \`@channel\` - there is probably no good reason to use those notifications in this channel` 
            },
            accessory: {
              type: 'image',
              image_url: 'https://assets3.thrillist.com/v1/image/2819884',
              alt_text: 'guidelines'
            }
          },
          {
            type: 'divider'
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Get started!* \n Introduce yourself and add some background about what your interested in getting out of this channel. How do you Get Stuff Done? We'd love to hear from you!`
            },
            accessory: {
              type: 'image',
              image_url: 'https://assets3.thrillist.com/v1/image/2819888',
              alt_text: 'rocket'
            }
          }
        ]
      },
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`
      },
      json: true,
      url: 'https://slack.com/api/chat.postEphemeral'
    }, function (err, resp, body) {
      console.log('sent', body)
      if (err) { console.log(err) }
      recentlySentMessages.push(payload.event.user)
    })
  }
  res.end()
})

app.listen(app.get('port'), () => {
  console.log('App is running')
})

module.exports = app
