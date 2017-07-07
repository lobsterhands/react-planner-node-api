var mongoose = require('mongoose');

var ActivitySchema = new mongoose.Schema({
  title: String,
  body: String,
  completed: Boolean,
  dateStart: { type: Date },
  dateEnd: { type: Date },
  tagList: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {timestamps: true});

ActivitySchema.methods.toJSON = function(){
  console.log('\nTHIS: %s', this);
  return {
    id: this._id,
    title: this.title,
    body: this.body,
    completed: this.completed,
    dateStart: this.dateStart,
    dateEnd: this.dateEnd,
    tagList: this.tagList,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

mongoose.model('Activity', ActivitySchema);
