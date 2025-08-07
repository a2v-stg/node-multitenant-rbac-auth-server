const mongoose = require('mongoose');

const MigrationSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    executionTime: {
      type: Number, // in milliseconds
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'applied', 'failed', 'rolled_back'],
      default: 'pending',
    },
    error: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
MigrationSchema.index({ version: 1 });
MigrationSchema.index({ status: 1 });
MigrationSchema.index({ appliedAt: 1 });

module.exports = mongoose.model('Migration', MigrationSchema);
