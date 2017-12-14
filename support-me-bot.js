require('dotenv').config()

const express = require('express')

const _ = require('lodash')
const TelegramBot = require('node-telegram-bot-api')

const TelegramApi = require('./src/telegram-api')
const Answers = require('./src/conversations').Answers
const Stage = require('./src/conversations').Stage
const Storage = require('./src/storage')
const OrgSelector = require('./src/org-selector')
const StateMachine = require('./src/state-machine')

const app = express()

const token = process.env.TELEGRAM_TOKEN_BOT
const bot = new TelegramBot(token, { polling: true })
const telegramApi = new TelegramApi(bot)
const answers = new Answers()
const storage = new Storage()
const orgSelector = new OrgSelector()
const sm = StateMachine()

const debugMode = true
const logger = function (message) {
  if (debugMode) {
    console.log(message)
  }
}

logger('Starting bot website...')
const port = process.env.PORT || 5000
app.use(express.static('public'))
app.listen(port, function () {
  logger(`Site is listening on port ${port}.`)
})

logger('Starting bot...')

bot.on('message', msg => runAction(msg))

let runAction = function(msg) {  
  let chatId = msg.chat.id
  let state = sm.getState(chatId)
  let msgIsValid = validators[state](msg, chatId)
  msgIsValid 
    ? actions[state](chatId, msg)
    : bot.sendMessage(chatId, storage.getErrorInvalidStage(answers.getLanguageCode(chatId)))
}

let actions = function() {
  const standard = function(chatId, msg) {
    answers.storeAnswer(chatId, sm.getState(chatId), msg.text)
    let nextState = sm.nextState(chatId)
    let nextConversation = storage.getConversation(answers.getLanguageCode(chatId), nextState)
    telegramApi.sendConversation(chatId, nextState, nextConversation)
  }
  return {
    start: function(chatId) {
      let nextState = sm.nextState(chatId)
      let nextConversation = storage.getConversation('en', nextState)
      telegramApi.sendConversation(chatId, nextState, nextConversation)
    },
    language: function(chatId, msg) {
      let languageCode = storage.getLanguageCode(msg.text)
      answers.storeAnswer(chatId, sm.getState(chatId), languageCode)
      let nextState = sm.nextState(chatId)
      let nextConversation = storage.getConversation(languageCode, nextState)
      telegramApi.sendConversation(chatId, nextState, nextConversation)
    },
    incident: standard,
    location: standard,
    age: standard,
    gender: standard,
    religion: function(chatId, msg) {
      answers.storeAnswer(chatId, sm.getState(chatId), msg.text)
      let allAnswers = answers.getConversation(chatId)
      logger(JSON.stringify(allAnswers))
      allAnswers = storage.normalizeAnswers(allAnswers, answers.getLanguageCode(chatId))
      logger(JSON.stringify(allAnswers))

      orgSelector.determineBestOrganization(allAnswers).then(result => {
        let bestOrganization = result
          ? `${result.name}\n${result.address}\n${result.phone}\n${result.email}`
          : 'No compatible organization was found. Sorry!'
        let nextState = sm.nextState(chatId)
        let nextConversation = storage.getConversation(answers.getLanguageCode(chatId), nextState)
        nextConversation.message = nextConversation.message.replace('$', bestOrganization)
        telegramApi.sendConversation(chatId, nextState, nextConversation)
        answers.deleteConversation(chatId)
        sm.reset(chatId)
      }, err => {
        console.log(err)
        bot.sendMessage(chatId, "Oops. Something went wrong. Il be back.")
        answers.deleteConversation(chatId)
        sm.reset(chatId)
      })
    }
  }
}()

let validators = function() {
  const standard = (msg, chatId) => storage.getReplyRegex(sm.getState(chatId), answers.getLanguageCode(chatId)).test(msg.text)
  return {
    start: _ => true,
    language: msg => storage.getReplyRegex('language').test(msg.text),  
    incident: standard,
    location: msg => msg.location !== undefined || /\d{5}/.test(msg.text),
    age: standard,
    gender: standard,
    religion: standard  
  }
}()
