# README
## Overview
The bot asks a series of multiple choice questions. Depending on the answers given, the bot then picks the geographically closest organization that suits the user's particular needs, and sends the contact details to the user.

## Structure
* db.json
  * Mappings of the questions, their answers, and translations thereof
* orgs.json
  * List of registered organizations
  * Organizations are categorized with an n-to-n relationship between organization and category
  * Longitude and latitude are required for distance calculation
* support-me-bot.js
  * Entry point for the bot
* state-machine.js
  * Controls conversation flow
* conversations.js
  * Tracks answers
* org-selector.js
  * Selects the most suitable organization by category and physical vicinity
  * Converts zip codes entered by the user to coordinates
* storage.js
  * Provides access to the questions and answers
  * Contains helper functions for user input validation
* telegram-api.js
  * Helper functions to simplify communication with the Telegram API

## Setup
1. Register a bot in Telegram
2. Create a .env file in the project directory
3. Set the following environment variables:
```
TELEGRAM_WEBHOOK_URL=abc  // optional
TELEGRAM_TOKEN_BOT=1234  // example
```
4. Run *npm install* from the project directory
5. Start the bot using *npm start*
6. Go to Telegram and message the bot (or type /help)

## AWS Elastic Beanstalk
* Tested on AWS EBS
* Run *npm run-script zip* to create an archive under */dist* that can be uploaded to AWS EBS
* Note that the port is passed by EBS to the application

## Todo
* Language specific feedback for
  * Rejected responses
  * Errors
* Handle invalid zip codes properly
* Handle not finding any candidate organizations
* There is a bug somewhere... :)