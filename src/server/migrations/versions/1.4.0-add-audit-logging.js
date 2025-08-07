/**
 * Migration: 1.4.0 - Add Audit Logging
 * Description: Add audit logging system for security and compliance
 * Date: 2024-01-01
 */

module.exports = {
  version: '1.4.0',
  name: 'Add Audit Logging',
  description: 'Add audit logging system for security and compliance',

  up: async db => {
    // Create audit log collection and indexes
    const mongoose = require('mongoose');

    const AuditLogSchema = new mongoose.Schema({
      action: { type: String, required: true },
      resource: { type: String, required: true },
      resourceId: mongoose.Schema.Types.ObjectId,
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'tenants' },
      ipAddress: String,
      userAgent: String,
      metadata: mongoose.Schema.Types.Mixed,
      timestamp: { type: Date, default: Date.now },
    });

    AuditLogSchema.index({ action: 1, timestamp: -1 });
    AuditLogSchema.index({ userId: 1, timestamp: -1 });
    AuditLogSchema.index({ tenantId: 1, timestamp: -1 });
    AuditLogSchema.index({ timestamp: -1 });

    mongoose.model('AuditLog', AuditLogSchema);
  },

  down: async db => {
    // Rollback audit logging
    const mongoose = require('mongoose');
    await mongoose.connection.db.dropCollection('auditlogs');
  },
};
