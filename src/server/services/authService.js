const { getContext } = require('../context');
const rbacService = require('./rbacService');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

class AuthService {
  constructor() {
    this.context = null;
    this.models = null;
  }

  // Helper function to generate redirect URLs
  _getRedirectUrl(path) {
    // Get base URL from environment or default to localhost:3000
    const baseUrl = process.env.CLIENT_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}${path}`;
  }

  _getContext() {
    if (!this.context) {
      this.context = getContext();
    }
    return this.context;
  }

  _getModels() {
    if (!this.models) {
      const context = this._getContext();
      this.models = {
        UserTenant: context.getModel('UserTenant'),
        Tenant: context.getModel('Tenant'),
        User: context.getModel('User'),
        Organization: context.getModel('Organization')
      };
    }
    return this.models;
  }

  async handleUserLogin(user) {
    try {
      const { UserTenant, Tenant } = this._getModels();
      // OAuth users bypass MFA and go directly to tenant selection
      if (user.oauthProvider === 'oauth2') {
        console.log('OAuth user detected, bypassing MFA');
        return await this.handleOAuthUserLogin(user);
      }

      // Check organization-level MFA requirements first (before tenant selection)
      const organizationMfaRequired =
        await this.isOrganizationMfaRequired(user);
      console.log('Organization MFA required:', organizationMfaRequired);

      if (organizationMfaRequired) {
        // Check if user has MFA configured
        if (!user.hasMfaConfigured()) {
          // First-time MFA setup required at organization level
          return {
            type: 'mfa_setup_required',
            user,
            redirectUrl: this._getRedirectUrl('/mfa-setup')
          };
        } else {
          // MFA verification required at organization level
          return {
            type: 'mfa_required',
            user,
            redirectUrl: this._getRedirectUrl('/mfa')
          };
        }
      }

      // If no organization MFA required, proceed with normal tenant flow
      return await this.handleTenantSelection(user);
    } catch (error) {
      console.trace('some trace');
      console.log(error);
      throw new Error(`Login processing failed: ${error.message}`);
    }
  }

  async handleOAuthUserLogin(user) {
    try {
      const { UserTenant, Tenant } = this._getModels();

      // Get all user's tenants
      const userTenants = await UserTenant.find({ user: user._id }).populate(
        'tenant'
      );
      console.log('OAuth user tenants:', userTenants.length);

      if (userTenants.length > 1) {
        console.log(
          'OAuth user has multiple tenants, redirecting to tenant selection'
        );
        return {
          type: 'multiple_tenants',
          tenants: userTenants.map(ut => ut.tenant),
          redirectUrl: this._getRedirectUrl('/tenant-selection')
        };
      }

      let selectedTenant = null;

      if (userTenants.length > 0) {
        selectedTenant = userTenants[0].tenant;
        console.log(
          'OAuth user using existing tenant:',
          selectedTenant.tenantId
        );
      } else {
        // Assign to default tenant
        selectedTenant = await Tenant.findOne({ tenantId: 'default' });
        if (!selectedTenant) {
          throw new Error('No default tenant configured');
        }

        await UserTenant.create({
          user: user._id,
          tenant: selectedTenant._id
        });

        await this.initializeUserInTenant(user._id, selectedTenant._id);
        console.log(
          'Assigned OAuth user to default tenant:',
          selectedTenant.tenantId
        );
      }

      return {
        type: 'single',
        tenant: selectedTenant,
        redirectUrl: this._getRedirectUrl('/dashboard')
      };
    } catch (error) {
      throw new Error(`OAuth login processing failed: ${error.message}`);
    }
  }

  async handleTenantSelection(user) {
    try {
      const { UserTenant, Tenant } = this._getModels();
      // Get all user's tenants
      const userTenants = await UserTenant.find({ user: user._id }).populate(
        'tenant'
      );
      console.log('User tenants:', userTenants.length);

      // Check if user has multiple tenants
      if (userTenants.length > 1) {
        console.log(
          'User has multiple tenants, redirecting to tenant selection'
        );
        return {
          type: 'multiple_tenants',
          tenants: userTenants.map(ut => ut.tenant),
          redirectUrl: this._getRedirectUrl('/tenant-selection')
        };
      }

      let selectedTenant = null;

      if (userTenants.length > 0) {
        // User has existing tenant assignments (single tenant)
        selectedTenant = userTenants[0].tenant;
        console.log('Using existing tenant:', selectedTenant.tenantId);
      } else {
        // If no user-specific tenants, use the default tenant
        selectedTenant = await Tenant.findOne({ tenantId: 'default' });
        if (!selectedTenant) {
          throw new Error('No default tenant configured');
        }

        // Create user-tenant relationship
        await UserTenant.create({
          user: user._id,
          tenant: selectedTenant._id
        });

        // Initialize RBAC roles for the tenant and assign default role to user
        await this.initializeUserInTenant(user._id, selectedTenant._id);
        console.log(
          'Assigned user to default tenant:',
          selectedTenant.tenantId
        );
      }

      console.log('Final tenant selection:', selectedTenant.tenantId);
      return {
        type: 'single',
        tenant: selectedTenant,
        redirectUrl: this._getRedirectUrl('/dashboard')
      };
    } catch (error) {
      throw new Error(`Tenant selection failed: ${error.message}`);
    }
  }

  async isOrganizationMfaRequired(user) {
    // OAuth users always skip MFA
    if (user.oauthProvider === 'oauth2') {
      console.log('OAuth user detected, skipping organization MFA');
      return false;
    }

    // Get the default organization configuration
    const { Organization } = this._getModels();
    const organization = await Organization.findOne({ organizationId: 'default' });
    if (!organization) {
      console.log('No default organization found, skipping organization MFA check');
      return false;
    }

    // Check organization MFA policy
    if (
      !organization.mfaEnabled ||
      !organization.mfaRequiredForLocalUsers
    ) {
      console.log('Organization MFA not enabled or required');
      return false;
    }

    // Check grace period for new users
    if (organization.mfaGracePeriod && user.createdAt) {
      const gracePeriodEnd = new Date(
        user.createdAt.getTime() +
          organization.mfaGracePeriod * 24 * 60 * 60 * 1000
      );
      if (new Date() < gracePeriodEnd) {
        console.log('User within grace period, skipping organization MFA');
        return false;
      }
    }

    return true;
  }

  isMfaRequired(user, tenant) {
    // OAuth users always skip MFA
    if (user.oauthProvider === 'oauth2') {
      console.log('OAuth user detected, skipping MFA');
      return false;
    }

    // Check tenant MFA policy
    if (!tenant.mfaEnabled || !tenant.mfaRequiredForLocalUsers) {
      console.log('Tenant MFA not enabled or required');
      return false;
    }

    // Check grace period for new users
    if (tenant.mfaGracePeriod && user.createdAt) {
      const gracePeriodEnd = new Date(
        user.createdAt.getTime() + tenant.mfaGracePeriod * 24 * 60 * 60 * 1000
      );
      if (new Date() < gracePeriodEnd) {
        console.log('User within grace period, skipping MFA');
        return false;
      }
    }

    return true;
  }

  async handleMfaVerification(user, token, method) {
    try {
      // Verify the MFA token based on the user's configured method
      const mfaService = require('./mfaService');
      let isValid = false;

      switch (method) {
      case 'totp':
        if (user.totpSecret) {
          isValid = mfaService.verifyTotpToken(user.totpSecret, token);
        }
        break;
      case 'sms':
      case 'voice':
        if (user.phoneNumber) {
          const result = await mfaService.verifyTwilioToken(
            user.phoneNumber,
            token,
            user.countryCode || '+1'
          );
          isValid = result.success;
        }
        break;
      case 'email':
        if (user.email) {
          const result = await mfaService.verifyEmailToken(user.email, token);
          isValid = result.success;
        }
        break;
      default:
        throw new Error('Unsupported MFA method');
      }

      if (!isValid) {
        throw new Error('Invalid MFA token');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // After MFA verification, proceed with tenant selection
      return await this.handleTenantSelection(user);
    } catch (error) {
      throw new Error(`MFA verification failed: ${error.message}`);
    }
  }

  async validateTenantAccess(userId, tenantId) {
    try {
      const { Tenant } = this._getModels();
      // First, find the tenant by tenantId
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Then check if the user has access to this specific tenant
      const userTenant = await this._getModels().UserTenant.findOne({
        user: userId,
        tenant: tenant._id
      });

      if (!userTenant) {
        throw new Error('Unauthorized tenant access');
      }

      return tenant;
    } catch (error) {
      throw new Error(`Tenant validation failed: ${error.message}`);
    }
  }

  async getUserTenants(userId) {
    try {
      const { UserTenant } = this._getModels();
      const userTenants = await UserTenant.find({ user: userId }).populate(
        'tenant'
      );
      return userTenants.map(ut => ut.tenant);
    } catch (error) {
      throw new Error(`Failed to fetch user tenants: ${error.message}`);
    }
  }

  async selectTenant(userId, tenantId) {
    try {
      const { Tenant } = this._getModels();
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const userTenant = await this._getModels().UserTenant.findOne({
        user: userId,
        tenant: tenant._id
      });

      if (!userTenant) {
        throw new Error('User not authorized for this tenant');
      }

      // Get user details for MFA checking
      const user = await this._getModels().User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if MFA is required for this tenant
      const mfaRequired = this.isMfaRequired(user, tenant);

      if (mfaRequired) {
        // Check if user has MFA configured
        if (!user.hasMfaConfigured()) {
          console.log('MFA setup required');
          return {
            type: 'mfa_setup_required',
            user,
            tenant,
            redirectUrl: this._getRedirectUrl('/mfa-setup')
          };
        } else {
          console.log('MFA required');
          return {
            type: 'mfa_required',
            user,
            tenant,
            redirectUrl: this._getRedirectUrl('/mfa')
          };
        }
      }

      return {
        type: 'success',
        tenant,
        redirectUrl: this._getRedirectUrl('/dashboard')
      };
    } catch (error) {
      throw new Error(`Tenant selection failed: ${error.message}`);
    }
  }

  // Initialize user in tenant with default role
  async initializeUserInTenant(userId, tenantId) {
    try {
      // Initialize tenant roles if they don't exist
      await rbacService.initializeTenantRoles(tenantId);

      // Get the default 'user' role
      const defaultRole = await rbacService
        .getTenantRoles(tenantId)
        .then(roles => roles.find(role => role.name === 'User'));

      if (defaultRole) {
        // Assign default role to user
        await rbacService.assignRole(userId, tenantId, defaultRole._id);
        console.log(
          `Assigned default role to user ${userId} in tenant ${tenantId}`
        );
      }
    } catch (error) {
      console.error('Failed to initialize user in tenant:', error);
      // Don't throw error as this is not critical for login
    }
  }

  // MFA Management Methods
  async setupMfaForUser(userId, method, secret = null) {
    try {
      const { User } = this._getModels();
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      await user.setupMfa(method, secret);
      return user;
    } catch (error) {
      throw new Error(`Failed to setup MFA: ${error.message}`);
    }
  }

  async updateUserPhoneNumber(userId, phoneNumber, countryCode = '+1') {
    try {
      const { User } = this._getModels();
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      await user.updatePhoneNumber(phoneNumber, countryCode);
      return user;
    } catch (error) {
      throw new Error(`Failed to update phone number: ${error.message}`);
    }
  }

  // Tenant MFA Management
  async enableMfaForTenant(tenantId) {
    try {
      const { Tenant } = this._getModels();
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      tenant.mfaEnabled = true;
      tenant.mfaRequiredForLocalUsers = true;
      await tenant.save();

      return tenant;
    } catch (error) {
      throw new Error(`Failed to enable MFA for tenant: ${error.message}`);
    }
  }

  async disableMfaForTenant(tenantId) {
    try {
      const { Tenant } = this._getModels();
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      tenant.mfaEnabled = false;
      tenant.mfaRequiredForLocalUsers = false;
      await tenant.save();

      return tenant;
    } catch (error) {
      throw new Error(`Failed to disable MFA for tenant: ${error.message}`);
    }
  }

  async updateTenantMfaMethods(tenantId, methods) {
    try {
      const { Tenant } = this._getModels();
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      tenant.mfaMethods = methods;
      await tenant.save();

      return tenant;
    } catch (error) {
      throw new Error(`Failed to update tenant MFA methods: ${error.message}`);
    }
  }

  // Organization-level MFA Management
  async enableOrganizationMfa(methods = ['totp']) {
    try {
      const { Organization } = this._getModels();
      const organization = await Organization.findOne({ organizationId: 'default' });
      if (!organization) {
        throw new Error('Default organization not found');
      }
      await organization.enableMfa(methods);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to enable organization MFA: ${error.message}`);
    }
  }

  async disableOrganizationMfa() {
    try {
      const { Organization } = this._getModels();
      const organization = await Organization.findOne({ organizationId: 'default' });
      if (!organization) {
        throw new Error('Default organization not found');
      }
      await organization.disableMfa();
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to disable organization MFA: ${error.message}`);
    }
  }

  async updateOrganizationMfaMethods(methods) {
    try {
      const { Organization } = this._getModels();
      const organization = await Organization.findOne({ organizationId: 'default' });
      if (!organization) {
        throw new Error('Default organization not found');
      }
      await organization.updateMfaMethods(methods);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to update organization MFA methods: ${error.message}`);
    }
  }

  async setOrganizationMfaGracePeriod(days) {
    try {
      const { Organization } = this._getModels();
      const organization = await Organization.findOne({ organizationId: 'default' });
      if (!organization) {
        throw new Error('Default organization not found');
      }
      await organization.setMfaGracePeriod(days);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to set organization MFA grace period: ${error.message}`);
    }
  }

  async getOrganizationMfaConfig() {
    try {
      const { Organization } = this._getModels();
      const organization = await Organization.findOne({ organizationId: 'default' });
      if (!organization) {
        throw new Error('Default organization not found');
      }
      return {
        enabled: organization.mfaEnabled,
        requiredForLocalUsers: organization.mfaRequiredForLocalUsers,
        methods: organization.mfaMethods,
        gracePeriod: organization.mfaGracePeriod
      };
    } catch (error) {
      throw new Error(`Failed to get organization MFA config: ${error.message}`);
    }
  }
}

module.exports = new AuthService();
