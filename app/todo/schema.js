const { Types } = require('../database/utils');
module.exports = {
  Todo: {
    Schema: {
      title: {
        type: String,
        required: true
      },
      body: {
        type: String,
        required: true
      },
      owner: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
      },
      complete: {
        type: Boolean,
        default: false
      },
      stage: {
        type: String,
        enum: {
          values: [
            'Not Started',
            'Started',
            'Blocked',
            'Under Review',
            'Testing',
            'Complete'
          ],
          message: '{VALUE} is not a valid value for {PATH}'
        },
        default: 'Not Started'
      }
    }
    // Hooks: (Schema) => { /* insert schema hooks */ },
    // Methods: (Schema) => { /* insert schema methods */ }
  }
};
