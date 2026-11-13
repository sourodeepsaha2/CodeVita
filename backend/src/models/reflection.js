const mongoose = require('mongoose');
const { Schema } = mongoose;

const reflectionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true, index: true },
    clientId: { type: String, required: true, trim: true, maxlength: 80 },
    problemId: { type: Schema.Types.ObjectId, ref: 'problem', default: null },
    submissionId: { type: Schema.Types.ObjectId, ref: 'submission', default: null },
    problem: { type: String, required: true, trim: true, minlength: 1, maxlength: 160 },
    approach: { type: String, required: true, trim: true, minlength: 1, maxlength: 4000 },
    blocker: { type: String, default: '', trim: true, maxlength: 2000 },
    confidence: { type: Number, required: true, min: 1, max: 5 },
    nextReviewAt: { type: Date, required: true, index: true },
    reviewCount: { type: Number, default: 0, min: 0 },
    isFavorite: { type: Boolean, default: false },
    lastReviewedAt: { type: Date, default: null },
}, { timestamps: true });

reflectionSchema.index({ userId: 1, clientId: 1 }, { unique: true });

module.exports = mongoose.model('reflection', reflectionSchema);
