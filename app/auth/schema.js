const { hashPassword, comparePassword } = require('./utils/bcrypt');
const { Types } = require('../database/utils');
const { todayPlusNDays } = require('../common/timeDate');

module.exports = {
  User: {
    Schema: {
      email: {
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
          type: Types.ObjectId,
          ref: 'Token'
        }
      ],
      systemAdministrator: {
        type: Boolean,
        default: false
      },
      administratorRoutes: [
        {
          type: String
        }
      ]
    },
    Hooks: Schema => {
      Schema.pre('save', async function handlePasswordHash(next) {
        try {
          const user = this;
          if (!user.isModified('password')) return next();
          user.password = await hashPassword(user.password);
          next();
        } catch (error) {
          throw new Error(error);
        }
      });
    },
    Methods: Schema => {
      Schema.methods.checkPassword = async function checkpassword(password) {
        try {
          const match = await comparePassword(password, this.password);
          return match;
        } catch (error) {
          throw new Error(error);
        }
      };
    }
  },
  Token: {
    Schema: {
      created_date: {
        type: Date,
        required: true,
        default: Date.now()
      },
      source: {
        deviceType: {
          type: String,
          required: true
        },
        ipAddress: {
          type: String
        }
      },
      user: {
        type: Types.ObjectId,
        ref: 'User'
      },
      data: {
        type: String,
        required: true,
        unique: true
      },
      expireDate: {
        type: Date,
        required: true,
        default: todayPlusNDays(2)
      }
    }
  }
};
