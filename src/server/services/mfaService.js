const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// Initialize Twilio client if credentials are available
let twilioClient = null;

const initializeTwilio = () => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (accountSid && authToken && verifySid) {
      twilioClient = require('twilio')(accountSid, authToken);
      console.log('Twilio client initialized');
    } else {
      console.warn('Twilio credentials not fully configured');
    }
  } catch (error) {
    console.warn('Twilio not available:', error.message);
  }
};

// Initialize client on module load
initializeTwilio();

class MfaService {
  /**
   * Generate TOTP secret for authenticator apps
   */
  static generateTotpSecret(email) {
    const options = {
      issuer: 'Fraud Detection Engine',
      name: `Fraud Detection Engine (${email})`,
      length: 32,
    };

    return speakeasy.generateSecret(options);
  }

  /**
   * Verify TOTP token
   */
  static verifyTotpToken(secret, token) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps (60 seconds) for clock skew
    });
  }

  /**
   * Generate QR code for authenticator app setup
   */
  static async generateQrCode(otpauthUrl) {
    try {
      return await qrcode.toDataURL(otpauthUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Send SMS verification via Twilio Verify
   */
  static async sendSmsVerification(phoneNumber, countryCode = '+1') {
    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    try {
      const formattedPhone = countryCode.startsWith('+')
        ? `${countryCode}${phoneNumber}`
        : `+${countryCode}${phoneNumber}`;

      const verification = await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({
          to: formattedPhone,
          channel: 'sms',
        });

      return {
        success: true,
        sid: verification.sid,
        status: verification.status,
        message: 'SMS verification sent successfully',
      };
    } catch (error) {
      console.error('Twilio SMS verification error:', error);
      throw new Error(`Failed to send SMS verification: ${error.message}`);
    }
  }

  /**
   * Send voice verification via Twilio Verify
   */
  static async sendVoiceVerification(phoneNumber, countryCode = '+1') {
    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    try {
      const formattedPhone = countryCode.startsWith('+')
        ? `${countryCode}${phoneNumber}`
        : `+${countryCode}${phoneNumber}`;

      const verification = await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({
          to: formattedPhone,
          channel: 'call',
        });

      return {
        success: true,
        sid: verification.sid,
        status: verification.status,
        message: 'Voice verification sent successfully',
      };
    } catch (error) {
      console.error('Twilio voice verification error:', error);
      throw new Error(`Failed to send voice verification: ${error.message}`);
    }
  }

  /**
   * Verify Twilio token
   */
  static async verifyTwilioToken(phoneNumber, token, countryCode = '+1') {
    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    try {
      const formattedPhone = countryCode.startsWith('+')
        ? `${countryCode}${phoneNumber}`
        : `+${countryCode}${phoneNumber}`;

      const verificationCheck = await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({
          to: formattedPhone,
          code: token,
        });

      const isApproved = verificationCheck.status === 'approved';

      return {
        success: isApproved,
        status: verificationCheck.status,
        message: isApproved
          ? 'Verification successful'
          : 'Verification failed',
      };
    } catch (error) {
      console.error('Twilio verification error:', error);
      throw new Error(`Failed to verify token: ${error.message}`);
    }
  }

  /**
   * Send email verification via Twilio Verify
   */
  static async sendEmailVerification(email) {
    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    try {
      const verification = await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({
          to: email,
          channel: 'email',
        });

      return {
        success: true,
        sid: verification.sid,
        status: verification.status,
        message: 'Email verification sent successfully',
      };
    } catch (error) {
      console.error('Twilio email verification error:', error);
      throw new Error(`Failed to send email verification: ${error.message}`);
    }
  }

  /**
   * Verify email token
   */
  static async verifyEmailToken(email, token) {
    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    try {
      const verificationCheck = await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({
          to: email,
          code: token,
        });

      const isApproved = verificationCheck.status === 'approved';

      return {
        success: isApproved,
        status: verificationCheck.status,
        message: isApproved
          ? 'Email verification successful'
          : 'Email verification failed',
      };
    } catch (error) {
      console.error('Twilio email verification error:', error);
      throw new Error(`Failed to verify email token: ${error.message}`);
    }
  }

  /**
   * Get available MFA methods based on user configuration
   */
  static getAvailableMethods(user) {
    const methods = [];

    // TOTP is always available
    methods.push('totp');

    // SMS/Voice/Email if Twilio is configured and user has phone/email
    if (twilioClient) {
      if (user.phoneNumber) {
        methods.push('sms', 'voice');
      }
      if (user.email) {
        methods.push('email');
      }
    }

    return methods;
  }

  /**
   * Check if Twilio is configured
   */
  static isTwilioConfigured() {
    return twilioClient !== null;
  }

  /**
   * Get Twilio configuration status
   */
  static getTwilioStatus() {
    return {
      configured: twilioClient !== null,
      accountSid: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'missing',
      authToken: process.env.TWILIO_AUTH_TOKEN ? 'configured' : 'missing',
      verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID ? 'configured' : 'missing',
    };
  }
}

module.exports = MfaService;
