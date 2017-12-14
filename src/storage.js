const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const Stage = require('./conversations').Stage

module.exports = function() {

  this.db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), "utf-8"))
  
  this.getReplyRegex = function(stage, languageCode) {
    let answers
    switch (stage){
      case Stage.language:
        answers = this.db.conversations.language.answers
        return new RegExp('^('+_.flattenDeep(answers).join('|')+')$')
      case Stage.location:
        return /\d{5}/
      case Stage.incident:
      case Stage.age:
      case Stage.religion:
      case Stage.gender:
        answers = this.db.conversations[stage].translations[languageCode].answers
        return new RegExp('^('+_.flattenDeep(answers).join('|')+')$')
      default:
        throw new RangeError(`Unknown Stage value [${stage}]`)
    }
  }

  this.getConversation = function(language, stage) {
    return stage === Stage.language
        ? this.db.conversations.language
        : this.db.conversations[stage].translations[language]
  }

  this.normalizeAnswers = function(answers, languageCode){
    if (languageCode === 'en') {
      return answers
    }
    let englishConversation = {}
    _.keys(answers).forEach((stage, index) => {
      if ( stage === Stage.language || stage === Stage.location){
        englishConversation[stage] = answers[stage]
      } else {
        let storedAnswers = _.flattenDeep(this.db.conversations[stage].translations[languageCode].answers)
        let answerIndex = _.findIndex(storedAnswers, answer => answer === answers[stage])
        englishConversation[stage] = _.flattenDeep(
          this.db.conversations[stage].translations.en.answers)[answerIndex]
      }      
    })
    return englishConversation
  }

  this.getLanguageCode = function(language) {
    return this.db.supportedLanguages[language]
  }

  this.getSkipWords = function(){
    return this.db.skipWords
  }

  this.getErrorInvalidInput = function(language) {
    return this.db.errors.invalidInput.translations[language].message
  }

  this.getErrorInvalidStage = function(language) {
    return this.db.errors.invalidStage.translations[language].message
  }

}
