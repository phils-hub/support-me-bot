const _ = require('lodash')

module.exports.Answers = function(){
  this.answers = {}
  
  this.storeAnswer = function(chatId, stage, answer){
    _.set(this.answers, [chatId, stage], answer)
  }

  this.getLanguageCode = function(chatId){
    let conversation = this.answers[chatId]
    return  conversation !== undefined ? conversation.language : 'en'
  }
  
  this.getConversation = function(chatId){
    return this.answers[chatId]
  }

  this.deleteConversation = function (chatId){
    _.unset(this.answers, chatId)
  }

  this.isValidStage = function(chatId, currentStage){
    if (_.isUndefined(this.answers[chatId])) {
      return false
    }
    switch(currentStage) {
      case Stage.incident:
        return !_.isUndefined(this.answers[chatId].language)
      case Stage.location:
        return !_.isUndefined(this.answers[chatId].incident)
      case Stage.age:
        return !_.isUndefined(this.answers[chatId].location)
      case Stage.gender:
        return !_.isUndefined(this.answers[chatId].age)
      case Stage.religion:
        return !_.isUndefined(this.answers[chatId].gender)
    }
  }
  
}

var Stage = {
  "language": "language",
  "incident": "incident",
  "location": "location",
  "age": "age",
  "gender": "gender",
  "religion": "religion",
  "done": "done"
}

module.exports.Stage = Stage

