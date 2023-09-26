const mongoose = require('mongoose');

const statisticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionHistory: [
    {
      date: { type: Date, default: Date.now },
      totalQuestions: Number,
      correctAnswers: Number,
      incorrectAnswers: Number,
      timePractice: Number,
      averageScore: Number,
    },
  ],
  timeProgress: [
    {
      intervalStart: Date,
      intervalEnd: Date,
      correctAnswers: Number,
      totalQuestions: Number,
    },
  ],
  achievements: [
    {
      name: String,
      description: String,
      earnedAt: Date,
    },
  ],
  themeProgress: [
    {
      theme: String,
      correctAnswers: Number,
      incorrectAnswers: Number,
    },
  ],
});

const Statistics = mongoose.model('Statistics', statisticsSchema);

module.exports = Statistics;
