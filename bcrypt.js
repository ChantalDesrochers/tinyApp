// Dummy Bcrypt Stub
// Written since there was an issue installing bcrypt

const crypto = require('crypto')

var bcrypt = {
  secret: "abc123",
  hashSync: function(password) {
    return crypto.createHmac('sha256', this.secret)
                   .update(password).digest('hex')
  },
  compareSync: function(userSuppliedPassword, passwordInDatabase) {
    var hash = crypto.createHmac('sha256', this.secret)
                   .update(userSuppliedPassword).digest('hex')
    return hash === passwordInDatabase

  }
}

// Example Test lines
// var hashedValue = bcrypt.hashSync("hello")
// console.log('Hash', hashedValue)
// console.log('Compare', bcrypt.compareSync("hello", hashedValue))

module.exports = bcrypt