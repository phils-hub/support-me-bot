const path = require("path")
const fs = require("fs")
const http = require("http")
const _ = require("lodash")
const getDistance = require("geodist")

module.exports = function() {

  this.orgDb = JSON.parse(fs.readFileSync(path.join(__dirname, 'orgs.json'), "utf-8"))

  this.determineBestOrganization = function(answers) {
    let organizationType = this.getOrganizationType(answers)
    let userCoordinatesPromise = answers.location instanceof Object
      ? new Promise((resolve, reject) => resolve(answers.location))
      : this.getCoordinates(answers.location)

    return userCoordinatesPromise.then(userCoordinates => {
      let candidates = this.getCandidates(organizationType)
      return this.getClosestCandidate(userCoordinates, candidates)
    })
  }

  this.getOrganizationType = function(answers) {
    if (answers.gender === 'Female') return 'women'
    if (answers.religion === 'Muslim') return 'muslim'
    if (answers.incident === 'Homophobia, anti-LGBTQ') return 'homophobe'
    if (answers.incident === 'Racism, anti-semitism or anti-islamism') return 'racism'
    return 'other'
  }

  this.getCoordinates = function(zipcode) {
    return new Promise(function (resolve, reject) {
      http.get("http://api.zippopotam.us/DE/" + zipcode, function (res) {
        if (res.statusCode > 299) {
          console.log("Zippopotam coordinates lookup failed with HTTP status code " + res.statusCode + " for zipcode " + zipcode + ".")
          reject({ code: res.statusCode, message: 'Zipcode is most probably invalid.' })
        }
        else {
          let rawData_1 = ''
          res.on('data', function (chunk) {
            rawData_1 += chunk
          }).on('end', function () {
            let data = JSON.parse(rawData_1)
            let _a = data.places[0], longitude = _a.longitude, latitude = _a.latitude
            resolve({ longitude: longitude, latitude: latitude })
          })
        }
      }).on('error', function (err) {
        reject(err)
      })
    })
  }
  
  this.getCandidates = function(organizationType) {
    let candidateIds = this.orgDb.lookup[organizationType] || []
    let candidateOrgs = candidateIds.map(value => this.orgDb.organizations[value])
    //console.log('Candidate organizations:\n')
    //console.log(candidateOrgs, true)
    //console.log('\n------------\n')
    return candidateOrgs
  }

  this.getClosestCandidate = function(userCoordinates, candidates) {
    let start = { lat: userCoordinates.latitude, lon: userCoordinates.longitude }
    let candidatesWithDistances = candidates.map(function (candidate) {
      let end = { lat: candidate.coordinates.latitude, lon: candidate.coordinates.longitude }
      candidate.distance = getDistance(start, end, { unit: 'kilometers' })
      return candidate
    })
    let closestCandidate = _.minBy(candidatesWithDistances, function (org) { return org.distance })
    return closestCandidate
  }

}
