const _ = require('lodash')

module.exports = function() {
  let states = {}
  let stateLabels = ['start', 'language', 'incident', 'location', 'age', 'gender', 'religion', 'done']
  let toLabel = index => stateLabels[index]
  return {
    reset: function(chatId) {
      states[chatId] = 0
      return states[chatId]
    },
    getState: function(chatId) {
      if (states[chatId] === undefined) {
        this.reset(chatId)
      }
      return toLabel(states[chatId])
    },
    nextState: function(chatId) {
      states[chatId] = states[chatId] !== undefined ? (states[chatId] + 1) % stateLabels.length : this.reset(chatId)
      return toLabel(states[chatId])
    }
  }

}