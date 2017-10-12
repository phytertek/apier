const { hashPassword, comparePassword } = require('./utils/bcrypt')

module.exports = {
  User: {
    Schema: {
      username: {
        type: String,
        required: true,
        unique: true
      },
      password: {
        type: String,
        required: true
      },
      activeTokens: [
        {
          type: String
        }
      ]
    },
    Hooks: Schema => {
      Schema.pre('save', async function handlePasswordHash(next) {
        try {
          const user = this
          if (!user.isModified('password')) return next()
          user.password = await hashPassword(user.password)
          next()
        } catch (error) {
          throw new Error(error)
        }
      })
    },
    Methods: Schema => {
      Schema.methods.checkPassword = async function checkpassword(password) {
        try {
          const match = await comparePassword(password, this.password)
          return match
        } catch (error) {
          throw new Error(error)
        }
      }
    }
  }
}
