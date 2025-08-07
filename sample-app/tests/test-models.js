require('module-alias/register');
const mongoose = require('mongoose');

async function testModels() {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/fde_doc_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Import the same way the app does
    const decisionModel = require('../stgcore-app-fde-engine/src/shared/db/models/decisionModel');
    const documentsModel = require('../stgcore-app-fde-engine/src/shared/db/models/documentsModel');
    const eventModel = require('../stgcore-app-fde-engine/src/shared/db/models/eventModel');
    const errorModel = require('../stgcore-app-fde-engine/src/shared/db/models/errorModel');
    const blackListModel = require('../stgcore-app-fde-engine/src/shared/db/models/blackListModel');
    const securityViolationModel = require('../stgcore-app-fde-engine/src/shared/db/models/securityViolationModel');
    const retroReviewModel = require('../stgcore-app-fde-engine/src/shared/db/models/retroreviewModel');
    
    // Register models with correct collection names (same as in app.js)
    const DecisionModel = mongoose.model('decisionTree', decisionModel.schema);
    const DocumentsModel = mongoose.model('documents', documentsModel.schema);
    const EventModel = mongoose.model('event', eventModel.schema);
    const ErrorModel = mongoose.model('error', errorModel.schema);
    const BlackListModel = mongoose.model('blackList', blackListModel.schema);
    const SecurityViolationModel = mongoose.model('securityViolation', securityViolationModel.schema);
    const RetroReviewModel = mongoose.model('retroreview', retroReviewModel.schema);
    
    console.log('\n🔍 Testing model queries with tenantId="default"...\n');
    
    const filter = { tenantId: 'default' };
    
    const results = await Promise.all([
      DecisionModel.countDocuments(filter),
      DocumentsModel.countDocuments(filter),
      EventModel.countDocuments(filter),
      ErrorModel.countDocuments(filter),
      BlackListModel.countDocuments(filter),
      SecurityViolationModel.countDocuments(filter),
      RetroReviewModel.countDocuments(filter),
    ]);
    
    console.log('📊 Results for tenantId="default":');
    console.log(`  Decisions: ${results[0]}`);
    console.log(`  Documents: ${results[1]}`);
    console.log(`  Events: ${results[2]}`);
    console.log(`  Errors: ${results[3]}`);
    console.log(`  Blacklist: ${results[4]}`);
    console.log(`  Security Violations: ${results[5]}`);
    console.log(`  Retro Reviews: ${results[6]}`);
    
    // Also test without filter
    console.log('\n📊 Total counts (no filter):');
    const totalResults = await Promise.all([
      DecisionModel.countDocuments({}),
      DocumentsModel.countDocuments({}),
      EventModel.countDocuments({}),
      ErrorModel.countDocuments({}),
      BlackListModel.countDocuments({}),
      SecurityViolationModel.countDocuments({}),
      RetroReviewModel.countDocuments({}),
    ]);
    
    console.log(`  Decisions: ${totalResults[0]}`);
    console.log(`  Documents: ${totalResults[1]}`);
    console.log(`  Events: ${totalResults[2]}`);
    console.log(`  Errors: ${totalResults[3]}`);
    console.log(`  Blacklist: ${totalResults[4]}`);
    console.log(`  Security Violations: ${totalResults[5]}`);
    console.log(`  Retro Reviews: ${totalResults[6]}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testModels();