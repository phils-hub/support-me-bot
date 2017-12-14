const _ = require('lodash')
const test = require('unit.js')
const StateMachine = require('../src/state-machine')

describe('StateMachine', function() {
  let chatId = '123'

  it('should by default be set to the initial state', function() {
    let sm = StateMachine()
    test
      .string(sm.getState(chatId))
      .match('start')
    
    test
      .string(sm.nextState('456'))
      .match('start')
  })

  it('should cleanly transition from end to beginning', function() {
    let sm = StateMachine()
    for (let i = 0; i < 10; i++) {
      sm.nextState(chatId)
    }
    console.log(sm.getState(chatId))
    test
      .string(sm.getState(chatId))
      .match('language')

  })
})