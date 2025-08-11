const mongoose = require('mongoose');
const TenantsModel = require('../models/Tenant');

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/fde_doc_db',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

async function insertTenantData() {
  try {
    console.log('Starting to insert tenant data...');

    // Clear existing tenant data
    await TenantsModel.deleteMany({});
    console.log('Cleared existing tenant data');

    // Insert Tenants with comprehensive configuration
    const tenantConfigs = [
      {
        tenantName: 'Default Tenant',
        tenantId: 'default',
        envName: 'production',
        apiKey: 'default-api-key-12345',
        sharedKey: 'default-shared-key-67890',
        callbackUrl: 'https://default-tenant.com/callback',
        callbackRetries: '3',
        allowedModules: [
          'document_verification',
          'identity_verification',
          'risk_assessment',
          'fraud_detection'
        ],
        allowedSocureSubModules: [
          'socure_identity',
          'socure_risk',
          'socure_fraud'
        ],
        rulesEngineHost: 'https://rules-engine.default-tenant.com',
        rulesEngineAccessToken: 'default-rules-token-12345',
        callbackEndpoint: 'https://default-tenant.com/api/callback',
        subscribeEventsFrom: [
          'document_events',
          'identity_events',
          'risk_events'
        ],
        selectedEvents: [
          'validation_started',
          'validation_completed',
          'validation_failed'
        ],
        documentCallbackUrl: 'https://default-tenant.com/document-callback',
        topFaceSimilarity: 0.85,
        topImageSimilarity: 0.8
      },
      {
        tenantName: 'New Tenant',
        tenantId: 'new',
        envName: 'staging',
        apiKey: 'new-api-key-54321',
        sharedKey: 'new-shared-key-09876',
        callbackUrl: 'https://new-tenant.com/callback',
        callbackRetries: '5',
        allowedModules: ['document_verification', 'identity_verification'],
        allowedSocureSubModules: ['socure_identity'],
        rulesEngineHost: 'https://rules-engine.new-tenant.com',
        rulesEngineAccessToken: 'new-rules-token-54321',
        callbackEndpoint: 'https://new-tenant.com/api/callback',
        subscribeEventsFrom: ['document_events', 'identity_events'],
        selectedEvents: ['validation_started', 'validation_completed'],
        documentCallbackUrl: 'https://new-tenant.com/document-callback',
        topFaceSimilarity: 0.75,
        topImageSimilarity: 0.7
      },
      {
        tenantName: 'A2V Tenant',
        tenantId: 'a2v',
        envName: 'development',
        apiKey: 'a2v-api-key-11111',
        sharedKey: 'a2v-shared-key-22222',
        callbackUrl: 'https://a2v-tenant.com/callback',
        callbackRetries: '2',
        allowedModules: [
          'document_verification',
          'identity_verification',
          'risk_assessment',
          'fraud_detection',
          'compliance_check'
        ],
        allowedSocureSubModules: [
          'socure_identity',
          'socure_risk',
          'socure_fraud',
          'socure_compliance'
        ],
        rulesEngineHost: 'https://rules-engine.a2v-tenant.com',
        rulesEngineAccessToken: 'a2v-rules-token-11111',
        callbackEndpoint: 'https://a2v-tenant.com/api/callback',
        subscribeEventsFrom: [
          'document_events',
          'identity_events',
          'risk_events',
          'fraud_events',
          'compliance_events'
        ],
        selectedEvents: [
          'validation_started',
          'validation_completed',
          'validation_failed',
          'document_processed',
          'risk_assessment_completed'
        ],
        documentCallbackUrl: 'https://a2v-tenant.com/document-callback',
        topFaceSimilarity: 0.9,
        topImageSimilarity: 0.85
      },
      {
        tenantName: 'Demo Tenant',
        tenantId: 'demo',
        envName: 'demo',
        apiKey: 'demo-api-key-99999',
        sharedKey: 'demo-shared-key-88888',
        callbackUrl: 'https://demo-tenant.com/callback',
        callbackRetries: '1',
        allowedModules: [
          'document_verification',
          'identity_verification',
          'risk_assessment'
        ],
        allowedSocureSubModules: ['socure_identity', 'socure_risk'],
        rulesEngineHost: 'https://rules-engine.demo-tenant.com',
        rulesEngineAccessToken: 'demo-rules-token-99999',
        callbackEndpoint: 'https://demo-tenant.com/api/callback',
        subscribeEventsFrom: ['document_events', 'identity_events'],
        selectedEvents: ['validation_started', 'validation_completed'],
        documentCallbackUrl: 'https://demo-tenant.com/document-callback',
        topFaceSimilarity: 0.8,
        topImageSimilarity: 0.75
      },
      {
        tenantName: 'Test Tenant',
        tenantId: 'test',
        envName: 'testing',
        apiKey: 'test-api-key-77777',
        sharedKey: 'test-shared-key-66666',
        callbackUrl: 'https://test-tenant.com/callback',
        callbackRetries: '3',
        allowedModules: [
          'document_verification',
          'identity_verification',
          'fraud_detection'
        ],
        allowedSocureSubModules: ['socure_identity', 'socure_fraud'],
        rulesEngineHost: 'https://rules-engine.test-tenant.com',
        rulesEngineAccessToken: 'test-rules-token-77777',
        callbackEndpoint: 'https://test-tenant.com/api/callback',
        subscribeEventsFrom: [
          'document_events',
          'identity_events',
          'fraud_events'
        ],
        selectedEvents: [
          'validation_started',
          'validation_completed',
          'validation_failed'
        ],
        documentCallbackUrl: 'https://test-tenant.com/document-callback',
        topFaceSimilarity: 0.85,
        topImageSimilarity: 0.8
      }
    ];

    await TenantsModel.insertMany(tenantConfigs);
    console.log(`✅ Inserted ${tenantConfigs.length} tenant configurations`);

    // Print tenant configuration details
    console.log('\n🏢 Tenant Configurations:');
    const tenantDetails = await TenantsModel.find(
      {},
      {
        tenantName: 1,
        tenantId: 1,
        envName: 1,
        allowedModules: 1,
        apiKey: 1,
        callbackUrl: 1
      }
    );

    tenantDetails.forEach(tenant => {
      console.log(`\n📋 ${tenant.tenantName} (${tenant.tenantId})`);
      console.log(`   Environment: ${tenant.envName}`);
      console.log(
        `   API Key: ${tenant.apiKey ? '✅ Configured' : '❌ Not Set'}`
      );
      console.log(`   Callback URL: ${tenant.callbackUrl || 'Not configured'}`);
      console.log(`   Modules: ${tenant.allowedModules.join(', ')}`);
    });

    console.log('\n📊 Summary:');
    console.log(`Total Tenants: ${tenantDetails.length}`);
    console.log(
      `Production: ${tenantDetails.filter(t => t.envName === 'production').length}`
    );
    console.log(
      `Staging: ${tenantDetails.filter(t => t.envName === 'staging').length}`
    );
    console.log(
      `Development: ${tenantDetails.filter(t => t.envName === 'development').length}`
    );
    console.log(
      `Demo: ${tenantDetails.filter(t => t.envName === 'demo').length}`
    );
    console.log(
      `Testing: ${tenantDetails.filter(t => t.envName === 'testing').length}`
    );
  } catch (error) {
    console.error('❌ Error inserting tenant data:', error);
  } finally {
    mongoose.connection.close();
  }
}

insertTenantData();
