
const mongoose = require('mongoose');

const { Schema } = mongoose;

const config = require("../config/model-config");

const tenantsSchema = new Schema(
    {
        "tenantName": {
            "type": "string",
            "required": true
        },
        "tenantId": {
            "type": "string",
            "required": true
        },
        "envName": {
            "type": "string",
            "required": true
        },
        "apiKey": {
            "type": "string"
        },
        "sharedKey": {
            "type": "string"
        },
        "callbackUrl": {
            "type": "string"
        },
        "callbackRetries":{
            "type":"string"
        },
        "allowedModules": {
            "type":["string"],
            "validate": {
                "validator": validModules
            }
        },
        "allowedSocureSubModules": {
            "type":["string"],
        },
        "rulesEngineHost": {
            "type": "string",
        },
        "rulesEngineAccessToken": {
            "type": "string",
        },
        "callbackEndpoint": {
            "type": "string"
        },
        "subscribeEventsFrom": {
            "type":["string"],
        },
        "selectedEvents": {
            "type": ["string"],
        },
        "documentCallbackUrl": {
            "type": "string"
        },
        "topFaceSimilarity": {
            "type": "number"
        },
        "topImageSimilarity": {
            "type": "number"
        },
        // Tenant-specific MFA configuration
        "mfaEnabled": {
            "type": "boolean",
            "default": false
        },
        "mfaGracePeriod": {
            "type": "number",
            "default": 0
        },
        "mfaMethods": {
            "type": ["string"],
            "default": ["totp"]
        },
        "mfaRequiredForLocalUsers": {
            "type": "boolean",
            "default": false
        }
    },
    { collection: 'tenants' }
)

function validModules(v){
    // check if every value in activeModules matches with incoming array.
    return config.activeModules.every(r => v.includes(r) ); 
}

module.exports = mongoose.model('Tenant', tenantsSchema);