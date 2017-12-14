const Stage = require('./conversations').Stage

module.exports = function(telegramBot){

  this.telegramBot = telegramBot
  
  this.sendConversation = function(chatId, stage, conversation){
    switch (stage){
      case Stage.language:
        return this.telegramBot.sendMessage(
          chatId, 
          conversation.message, 
          { reply_markup: { keyboard: conversation.answers, resize_keyboard: true } }
        )
      case Stage.incident:
      case Stage.location:
      case Stage.age:
      case Stage.gender:
      case Stage.religion:
        this.telegramBot.sendChatAction(chatId, "typing")
        return new Promise((resolve, reject) => {
          setTimeout(_ => {
            resolve(this.telegramBot.sendMessage(
                chatId, conversation.message, { 
                  reply_markup: {
                    keyboard: conversation.answers, resize_keyboard: true, one_time_keyboard: true
                  }
                }
            ))
          }, 1000)
        })
      case Stage.done:
        this.telegramBot.sendChatAction(chatId, "typing")
        return new Promise((resolve, reject) => {
          setTimeout(_ => {
            resolve(this.telegramBot.sendMessage(
                chatId, conversation.message
            ))
          }, 1000)
        })
      default:
        throw new RangeError(`Unknown stage value [${stage}]`)
    }
  }

  this.sendResult = function(chatId, result, messageTemplate){
    return this.telegramBot.sendMessage(
      chatId,
      messageTemplate.replace('$', result),
      {reply_markup: {remove_keyboard: true}}
    )
  } 
} 