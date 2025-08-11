const mongoose = require('mongoose');
const DecisionModel = require('@shared-models/decisionModel');
const DocumentsModel = require('@shared-models/documentsModel');
const EventModel = require('@shared-models/eventModel');
const ErrorModel = require('@shared-models/errorModel');
const BlackListModel = require('@shared-models/blackListModel');
const SecurityViolationModel = require('@shared-models/securityViolationModel');
const RetroReviewModel = require('@shared-models/retroreviewModel');
const TenantsModel = require('../models/Tenant');

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/fde_doc_db',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

const tenants = ['default', 'new', 'a2v'];

async function insertTestData() {
  try {
    console.log('Starting to insert test data...');

    // Clear existing test data
    await Promise.all([
      DecisionModel.deleteMany({}),
      DocumentsModel.deleteMany({}),
      EventModel.deleteMany({}),
      ErrorModel.deleteMany({}),
      BlackListModel.deleteMany({}),
      SecurityViolationModel.deleteMany({}),
      RetroReviewModel.deleteMany({}),
      TenantsModel.deleteMany({})
    ]);

    console.log('Cleared existing test data');

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
      }
    ];

    await TenantsModel.insertMany(tenantConfigs);
    console.log(`Inserted ${tenantConfigs.length} tenant configurations`);

    // Insert Decisions
    const decisions = [];
    for (let i = 1; i <= 50; i++) {
      for (const tenant of tenants) {
        decisions.push({
          applicationNumber: `APP-${tenant.toUpperCase()}-${String(i).padStart(4, '0')}`,
          fdeReference: `FDE-${tenant.toUpperCase()}-${String(i).padStart(4, '0')}`,
          tenantId: tenant,
          validation: {
            decision: Math.random() > 0.3 ? 'APPROVED' : 'REJECTED',
            score: Math.floor(Math.random() * 100),
            riskLevel: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)]
          },
          createdTime: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ),
          updatedTime: new Date()
        });
      }
    }
    await DecisionModel.insertMany(decisions);
    console.log(`Inserted ${decisions.length} decisions`);

    // Insert Documents
    const documents = [];
    for (let i = 1; i <= 40; i++) {
      for (const tenant of tenants) {
        documents.push({
          documentId: `DOC-${tenant.toUpperCase()}-${String(i).padStart(4, '0')}`,
          documentType: [
            'PASSPORT',
            'DRIVERS_LICENSE',
            'NATIONAL_ID',
            'UTILITY_BILL'
          ][Math.floor(Math.random() * 4)],
          tenantId: tenant,
          sourceReference: `SRC-${tenant.toUpperCase()}-${String(i).padStart(4, '0')}`,
          documentName: `document-${i}.pdf`,
          documentTag: `TAG-${i}`,
          documentExtn: 'pdf',
          fraudulentDocumentStatus: Math.random() > 0.8,
          fillableCheckStatus: Math.random() > 0.5,
          unableToVerifyFileType: Math.random() > 0.9,
          zeroByteCheck: Math.random() > 0.95,
          documentCategory: ['IDENTITY', 'ADDRESS', 'FINANCIAL', 'OTHER'][
            Math.floor(Math.random() * 4)
          ],
          metadata: {
            size: Math.floor(Math.random() * 1000000),
            uploadedBy: `user-${i}@${tenant}.com`,
            uploadTime: new Date()
          },
          documentValidation: {
            isValid: Math.random() > 0.2,
            validationScore: Math.floor(Math.random() * 100),
            validationDate: new Date()
          }
        });
      }
    }
    await DocumentsModel.insertMany(documents);
    console.log(`Inserted ${documents.length} documents`);

    // Insert Events
    const events = [];
    for (let i = 1; i <= 100; i++) {
      for (const tenant of tenants) {
        events.push({
          sourceReference: `SRC-${tenant.toUpperCase()}-${String(i).padStart(4, '0')}`,
          entityId: `ENT-${tenant.toUpperCase()}-${String(i).padStart(4, '0')}`,
          applicationNumber: `APP-${tenant.toUpperCase()}-${String(i).padStart(4, '0')}`,
          tenantId: tenant,
          validationType: [
            'IDENTITY_VERIFICATION',
            'DOCUMENT_VALIDATION',
            'RISK_ASSESSMENT'
          ][Math.floor(Math.random() * 3)],
          validationModule: ['OCR', 'FACE_MATCH', 'LIVENESS_DETECTION'][
            Math.floor(Math.random() * 3)
          ],
          validationStatus: ['PASSED', 'FAILED', 'PENDING'][
            Math.floor(Math.random() * 3)
          ],
          score: Math.floor(Math.random() * 100),
          eventType: [
            'VALIDATION_STARTED',
            'VALIDATION_COMPLETED',
            'VALIDATION_FAILED'
          ][Math.floor(Math.random() * 3)],
          entityValue: `test@${tenant}.com`,
          moduleValidationStatus: ['SUCCESS', 'FAILURE', 'TIMEOUT'][
            Math.floor(Math.random() * 3)
          ],
          additionalInfo: `Additional info for event ${i}`,
          retroreviewed: Math.random() > 0.7,
          createdTime: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ),
          validationDetails: {
            value: `Validation value ${i}`,
            id: `VAL-${i}`,
            additionalInfo: `Validation additional info ${i}`,
            remarks: [`Remark 1 for ${i}`, `Remark 2 for ${i}`],
            score: Math.floor(Math.random() * 100),
            riskVerifiedTime: new Date().toISOString(),
            moduleValidationStatus: ['SUCCESS', 'FAILURE'][
              Math.floor(Math.random() * 2)
            ],
            validationStatus: ['PASSED', 'FAILED'][
              Math.floor(Math.random() * 2)
            ],
            traceDetails: {
              callbackUrl: `https://${tenant}.com/callback`,
              traceId: `TRACE-${i}`,
              referenceId: `REF-${i}`
            }
          },
          validationHistory: [
            {
              timestamp: new Date(),
              status: 'INITIATED',
              details: 'Validation process started'
            }
          ]
        });
      }
    }
    await EventModel.insertMany(events);
    console.log(`Inserted ${events.length} events`);

    // Insert Errors
    const errors = [];
    for (let i = 1; i <= 20; i++) {
      for (const tenant of tenants) {
        errors.push({
          errorId: `ERR-${tenant.toUpperCase()}-${String(i).padStart(4, '0')}`,
          tenantId: tenant,
          errorType: [
            'VALIDATION_ERROR',
            'SYSTEM_ERROR',
            'TIMEOUT_ERROR',
            'NETWORK_ERROR'
          ][Math.floor(Math.random() * 4)],
          errorMessage: `Error message for ${tenant} - ${i}`,
          errorCode: `E${String(i).padStart(3, '0')}`,
          severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][
            Math.floor(Math.random() * 4)
          ],
          retryCount: Math.floor(Math.random() * 5),
          retryStatus: ['PENDING', 'COMPLETED', 'FAILED'][
            Math.floor(Math.random() * 3)
          ],
          createdAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ),
          updatedAt: new Date()
        });
      }
    }
    await ErrorModel.insertMany(errors);
    console.log(`Inserted ${errors.length} errors`);

    // Insert Blacklist
    const blacklist = [];
    for (let i = 1; i <= 15; i++) {
      for (const tenant of tenants) {
        blacklist.push({
          entityValue: `blacklisted@${tenant}.com`,
          entityType: ['EMAIL', 'PHONE', 'IP_ADDRESS', 'DEVICE_ID'][
            Math.floor(Math.random() * 4)
          ],
          tenantId: tenant,
          blacklistReason: [
            'FRAUD',
            'SPAM',
            'SECURITY_VIOLATION',
            'POLICY_VIOLATION'
          ][Math.floor(Math.random() * 4)],
          blacklistSource: ['MANUAL', 'AUTOMATED', 'EXTERNAL'][
            Math.floor(Math.random() * 3)
          ],
          createdAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ),
          updatedAt: new Date()
        });
      }
    }
    await BlackListModel.insertMany(blacklist);
    console.log(`Inserted ${blacklist.length} blacklist entries`);

    // Insert Security Violations
    const securityViolations = [];
    for (let i = 1; i <= 25; i++) {
      for (const tenant of tenants) {
        securityViolations.push({
          tenantId: tenant,
          sourceReference: `SRC-${tenant.toUpperCase()}-${String(i).padStart(4, '0')}`,
          violationCategory: [
            'UNAUTHORIZED_ACCESS',
            'DATA_BREACH',
            'MALWARE_DETECTED',
            'SUSPICIOUS_ACTIVITY'
          ][Math.floor(Math.random() * 4)],
          message: `Security violation message for ${tenant} - ${i}`,
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          pathInfo: '/api/v1/sensitive-data',
          queryString: 'action=view&id=123',
          userDetails: {
            userId: `user-${i}`,
            email: `user-${i}@${tenant}.com`,
            sessionId: `session-${i}`
          },
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Accept: 'application/json',
            Authorization: 'Bearer invalid-token'
          },
          requestBody: {
            action: 'view',
            resourceId: '123'
          },
          details: {
            severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][
              Math.floor(Math.random() * 4)
            ],
            affectedEntity: `entity-${i}@${tenant}.com`,
            violationSource: [
              'SYSTEM_MONITOR',
              'USER_REPORT',
              'AUTOMATED_DETECTION'
            ][Math.floor(Math.random() * 3)],
            status: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'][
              Math.floor(Math.random() * 4)
            ]
          }
        });
      }
    }
    await SecurityViolationModel.insertMany(securityViolations);
    console.log(`Inserted ${securityViolations.length} security violations`);

    // Insert Retro Reviews
    const retroReviews = [];
    for (let i = 1; i <= 30; i++) {
      for (const tenant of tenants) {
        retroReviews.push({
          reviewId: `REV-${tenant.toUpperCase()}-${String(i).padStart(4, '0')}`,
          tenantId: tenant,
          reviewType: [
            'MANUAL_REVIEW',
            'AUTOMATED_REVIEW',
            'ESCALATION_REVIEW'
          ][Math.floor(Math.random() * 3)],
          reviewStatus: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'][
            Math.floor(Math.random() * 4)
          ],
          reviewReason: [
            'HIGH_RISK',
            'SUSPICIOUS_ACTIVITY',
            'POLICY_VIOLATION',
            'MANUAL_FLAG'
          ][Math.floor(Math.random() * 4)],
          reviewerId: `reviewer-${i}@${tenant}.com`,
          reviewNotes: `Review notes for ${tenant} - ${i}`,
          originalDecision: ['APPROVED', 'REJECTED'][
            Math.floor(Math.random() * 2)
          ],
          finalDecision: ['APPROVED', 'REJECTED', 'PENDING'][
            Math.floor(Math.random() * 3)
          ],
          createdAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ),
          updatedAt: new Date()
        });
      }
    }
    await RetroReviewModel.insertMany(retroReviews);
    console.log(`Inserted ${retroReviews.length} retro reviews`);

    console.log('✅ All test data inserted successfully!');

    // Print summary
    const summary = await Promise.all([
      TenantsModel.countDocuments(),
      DecisionModel.countDocuments(),
      DocumentsModel.countDocuments(),
      EventModel.countDocuments(),
      ErrorModel.countDocuments(),
      BlackListModel.countDocuments(),
      SecurityViolationModel.countDocuments(),
      RetroReviewModel.countDocuments()
    ]);

    console.log('\n📊 Data Summary:');
    console.log(`Tenants: ${summary[0]}`);
    console.log(`Decisions: ${summary[1]}`);
    console.log(`Documents: ${summary[2]}`);
    console.log(`Events: ${summary[3]}`);
    console.log(`Errors: ${summary[4]}`);
    console.log(`Blacklist: ${summary[5]}`);
    console.log(`Security Violations: ${summary[6]}`);
    console.log(`Retro Reviews: ${summary[7]}`);

    // Print tenant configuration details
    console.log('\n🏢 Tenant Configurations:');
    const tenantDetails = await TenantsModel.find(
      {},
      { tenantName: 1, tenantId: 1, envName: 1, allowedModules: 1 }
    );
    tenantDetails.forEach(tenant => {
      console.log(
        `  - ${tenant.tenantName} (${tenant.tenantId}) - ${tenant.envName}`
      );
      console.log(`    Modules: ${tenant.allowedModules.join(', ')}`);
    });
  } catch (error) {
    console.error('Error inserting test data:', error);
  } finally {
    mongoose.connection.close();
  }
}

insertTestData();
