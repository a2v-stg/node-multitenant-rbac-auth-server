// context.js - Admin UI Submodule Context Management
let context;

function createContext({ config, logger, mongoose, models = {} }) {
  // Load models with the specific mongoose instance
  let contextModels = models;

  if (mongoose && mongoose.connection.readyState === 1) {
    try {
      const { getModelsWithConnection } = require('./models');
      contextModels = { ...models, ...getModelsWithConnection(mongoose) };
    } catch (error) {
      console.warn('⚠️ Could not load models with connection:', error.message);
    }
  }

  return {
    config,
    logger,
    mongoose,
    models: contextModels,
    getModel(name) {
      // If model is already provided in context, use it
      if (contextModels[name]) {
        return contextModels[name];
      }

      // Otherwise, try to load from models directory with the correct mongoose instance
      try {
        if (mongoose && mongoose.connection.readyState === 1) {
          // Check if model is already registered
          try {
            return mongoose.model(name);
          } catch (error) {
            // Model not registered, create it
            console.log('🔍 Model not registered, creating it:', name);
            const ModelSchema = require(`./models/${name}`).schema;
            return mongoose.model(name, ModelSchema);
          }
        } else {
          throw new Error('Database connection not ready');
        }
      } catch (error) {
        throw new Error(`Model ${name} not found or database not ready: ${error.message}`);
      }
    },
    getMongoose() {
      return mongoose;
    },
    getLogger() {
      return logger;
    }
  };
}

function initContext(ctx) {
  context = ctx;
}

function getContext() {
  if (!context) {
    throw new Error('Admin UI context not initialized. Call initContext() first.');
  }
  return context;
}

module.exports = {
  createContext,
  initContext,
  getContext
};
