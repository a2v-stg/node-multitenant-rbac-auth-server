const mongoose = require('mongoose');
const DecisionModel = require('@shared-models/decisionModel');
const DocumentsModel = require('@shared-models/documentsModel');
const EventModel = require('@shared-models/eventModel');
const ErrorModel = require('@shared-models/errorModel');
const BlackListModel = require('@shared-models/blackListModel');
const SecurityViolationModel = require('@shared-models/securityViolationModel');
const RetroReviewModel = require('@shared-models/retroreviewModel');

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/fde_doc_db',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function verifyData() {
  try {
    console.log('🔍 Verifying test data in database...\n');

    // Check each collection
    const decisions = await DecisionModel.countDocuments();
    const documents = await DocumentsModel.countDocuments();
    const events = await EventModel.countDocuments();
    const errors = await ErrorModel.countDocuments();
    const blacklist = await BlackListModel.countDocuments();
    const securityViolations = await SecurityViolationModel.countDocuments();
    const retroReviews = await RetroReviewModel.countDocuments();

    console.log('📊 Database Summary:');
    console.log(`✅ Decisions: ${decisions} records`);
    console.log(`✅ Documents: ${documents} records`);
    console.log(`✅ Events: ${events} records`);
    console.log(`✅ Errors: ${errors} records`);
    console.log(`✅ Blacklist: ${blacklist} records`);
    console.log(`✅ Security Violations: ${securityViolations} records`);
    console.log(`✅ Retro Reviews: ${retroReviews} records`);

    // Show sample data
    console.log('\n📋 Sample Data:');

    const sampleDecision = await DecisionModel.findOne();
    if (sampleDecision) {
      console.log('\n🔍 Sample Decision:');
      console.log(`   Application: ${sampleDecision.applicationNumber}`);
      console.log(`   Tenant: ${sampleDecision.tenantId}`);
      console.log(`   Decision: ${sampleDecision.validation?.decision}`);
    }

    const sampleDocument = await DocumentsModel.findOne();
    if (sampleDocument) {
      console.log('\n📄 Sample Document:');
      console.log(`   Document ID: ${sampleDocument.documentId}`);
      console.log(`   Tenant: ${sampleDocument.tenantId}`);
      console.log(`   Type: ${sampleDocument.documentType}`);
      console.log(`   Fraudulent: ${sampleDocument.fraudulentDocumentStatus}`);
    }

    const sampleEvent = await EventModel.findOne();
    if (sampleEvent) {
      console.log('\n📅 Sample Event:');
      console.log(`   Application: ${sampleEvent.applicationNumber}`);
      console.log(`   Tenant: ${sampleEvent.tenantId}`);
      console.log(`   Validation Type: ${sampleEvent.validationType}`);
      console.log(`   Status: ${sampleEvent.validationStatus}`);
    }

    console.log('\n🎉 Data verification complete!');

    if (decisions > 0 && documents > 0 && events > 0) {
      console.log('✅ All test data is present and ready for the UI!');
    } else {
      console.log(
        '❌ Some data is missing. Please run the insert script again.'
      );
    }
  } catch (error) {
    console.error('❌ Error verifying data:', error);
  } finally {
    mongoose.connection.close();
  }
}

verifyData();
