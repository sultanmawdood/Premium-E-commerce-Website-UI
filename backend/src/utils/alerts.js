const nodemailer = require('nodemailer');
const axios = require('axios');
const { logger } = require('./logger');

class AlertManager {
  constructor() {
    this.emailTransporter = null;
    this.telegramBot = null;
    this.alertThresholds = {
      errorRate: 0.05, // 5% error rate
      responseTime: 2000, // 2 seconds
      memoryUsage: 0.85, // 85% memory usage
      cpuUsage: 0.80, // 80% CPU usage
      diskUsage: 0.90, // 90% disk usage
      dbConnectionFailures: 3 // 3 consecutive failures
    };
    
    this.alertCooldowns = new Map(); // Prevent spam
    this.healthHistory = [];
    
    this.initializeTransports();
  }

  initializeTransports() {
    // Email transport
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      this.emailTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      
      logger.info('Email alerts configured');
    }

    // Telegram bot
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      this.telegramBot = {
        token: process.env.TELEGRAM_BOT_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_ID
      };
      
      logger.info('Telegram alerts configured');
    }
  }

  // Check if alert is in cooldown period
  isInCooldown(alertType, cooldownMinutes = 15) {
    const key = alertType;
    const lastAlert = this.alertCooldowns.get(key);
    
    if (!lastAlert) return false;
    
    const cooldownMs = cooldownMinutes * 60 * 1000;
    return (Date.now() - lastAlert) < cooldownMs;
  }

  // Set alert cooldown
  setCooldown(alertType) {
    this.alertCooldowns.set(alertType, Date.now());
  }

  // Send email alert
  async sendEmailAlert(subject, message, priority = 'normal') {
    if (!this.emailTransporter) {
      logger.warn('Email transport not configured');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.ALERT_EMAIL || process.env.SMTP_USER,
        subject: `[KingSports API] ${subject}`,
        html: this.generateEmailTemplate(subject, message, priority),
        priority: priority === 'critical' ? 'high' : 'normal'
      };

      await this.emailTransporter.sendMail(mailOptions);
      logger.info('Email alert sent', { subject, priority });
      return true;
    } catch (error) {
      logger.error('Failed to send email alert', { error: error.message });
      return false;
    }
  }

  // Send Telegram alert
  async sendTelegramAlert(message, priority = 'normal') {
    if (!this.telegramBot) {
      logger.warn('Telegram bot not configured');
      return false;
    }

    try {
      const emoji = priority === 'critical' ? '🚨' : 
                   priority === 'warning' ? '⚠️' : 'ℹ️';
      
      const formattedMessage = `${emoji} *KingSports API Alert*\n\n${message}`;
      
      const response = await axios.post(
        `https://api.telegram.org/bot${this.telegramBot.token}/sendMessage`,
        {
          chat_id: this.telegramBot.chatId,
          text: formattedMessage,
          parse_mode: 'Markdown'
        }
      );

      logger.info('Telegram alert sent', { priority });
      return true;
    } catch (error) {
      logger.error('Failed to send Telegram alert', { error: error.message });
      return false;
    }
  }

  // Send alert via all configured channels
  async sendAlert(subject, message, priority = 'normal') {
    const alertType = subject.toLowerCase().replace(/\s+/g, '_');
    
    // Check cooldown
    if (this.isInCooldown(alertType)) {
      logger.info('Alert skipped due to cooldown', { alertType });
      return;
    }

    const promises = [];
    
    // Send email
    promises.push(this.sendEmailAlert(subject, message, priority));
    
    // Send Telegram
    promises.push(this.sendTelegramAlert(message, priority));

    try {
      await Promise.all(promises);
      this.setCooldown(alertType);
      
      logger.info('Alert sent successfully', {
        subject,
        priority,
        alertType
      });
    } catch (error) {
      logger.error('Failed to send alerts', { error: error.message });
    }
  }

  // Generate HTML email template
  generateEmailTemplate(subject, message, priority) {
    const color = priority === 'critical' ? '#dc3545' : 
                 priority === 'warning' ? '#ffc107' : '#17a2b8';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background-color: ${color}; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f8f9fa; padding: 20px; }
          .footer { background-color: #6c757d; color: white; padding: 10px; text-align: center; font-size: 12px; }
          .timestamp { color: #6c757d; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${subject}</h2>
          </div>
          <div class="content">
            <p>${message.replace(/\n/g, '<br>')}</p>
            <p class="timestamp">
              <strong>Timestamp:</strong> ${new Date().toISOString()}<br>
              <strong>Server:</strong> ${process.env.SERVER_NAME || 'Unknown'}<br>
              <strong>Environment:</strong> ${process.env.NODE_ENV || 'Unknown'}
            </p>
          </div>
          <div class="footer">
            KingSports API Monitoring System
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Health check monitoring
  async monitorHealth(healthData) {
    this.healthHistory.push({
      timestamp: Date.now(),
      data: healthData
    });

    // Keep only last 10 health checks
    if (this.healthHistory.length > 10) {
      this.healthHistory.shift();
    }

    // Check for critical issues
    if (healthData.status === 'unhealthy') {
      await this.sendAlert(
        'Service Unhealthy',
        `API health check failed:\n\n${JSON.stringify(healthData, null, 2)}`,
        'critical'
      );
    }

    // Check database connectivity
    if (healthData.checks?.mongodb?.status === 'unhealthy') {
      await this.sendAlert(
        'Database Connection Failed',
        `MongoDB connection is unhealthy:\n${healthData.checks.mongodb.error}`,
        'critical'
      );
    }

    // Check Redis connectivity
    if (healthData.checks?.redis?.status === 'unhealthy') {
      await this.sendAlert(
        'Cache Connection Failed',
        `Redis connection is unhealthy:\n${healthData.checks.redis.error}`,
        'warning'
      );
    }

    // Check memory usage
    if (healthData.memory) {
      const memoryUsagePercent = healthData.memory.heapUsed / healthData.memory.heapTotal;
      if (memoryUsagePercent > this.alertThresholds.memoryUsage) {
        await this.sendAlert(
          'High Memory Usage',
          `Memory usage is at ${(memoryUsagePercent * 100).toFixed(1)}%\n` +
          `Heap Used: ${Math.round(healthData.memory.heapUsed / 1024 / 1024)}MB\n` +
          `Heap Total: ${Math.round(healthData.memory.heapTotal / 1024 / 1024)}MB`,
          'warning'
        );
      }
    }
  }

  // Monitor error rates
  async monitorErrorRate(errorCount, totalRequests) {
    if (totalRequests === 0) return;
    
    const errorRate = errorCount / totalRequests;
    
    if (errorRate > this.alertThresholds.errorRate) {
      await this.sendAlert(
        'High Error Rate',
        `Error rate is ${(errorRate * 100).toFixed(2)}%\n` +
        `Errors: ${errorCount}\n` +
        `Total Requests: ${totalRequests}`,
        'warning'
      );
    }
  }

  // Monitor response times
  async monitorResponseTime(averageResponseTime, p95ResponseTime) {
    if (p95ResponseTime > this.alertThresholds.responseTime) {
      await this.sendAlert(
        'High Response Time',
        `95th percentile response time is ${p95ResponseTime}ms\n` +
        `Average response time: ${averageResponseTime}ms\n` +
        `Threshold: ${this.alertThresholds.responseTime}ms`,
        'warning'
      );
    }
  }

  // Business alerts
  async sendBusinessAlert(event, data) {
    const alerts = {
      'payment_failed': {
        subject: 'Payment Processing Failed',
        message: `Payment failed for order ${data.orderId}\nAmount: $${data.amount}\nReason: ${data.reason}`,
        priority: 'warning'
      },
      'high_order_volume': {
        subject: 'High Order Volume Detected',
        message: `Unusual order volume detected: ${data.count} orders in the last hour`,
        priority: 'normal'
      },
      'inventory_low': {
        subject: 'Low Inventory Alert',
        message: `Product "${data.productName}" is running low on inventory\nCurrent stock: ${data.stock}`,
        priority: 'normal'
      },
      'security_breach': {
        subject: 'Security Alert',
        message: `Potential security issue detected:\n${data.description}\nIP: ${data.ip}`,
        priority: 'critical'
      }
    };

    const alert = alerts[event];
    if (alert) {
      await this.sendAlert(alert.subject, alert.message, alert.priority);
    }
  }

  // Test alerts
  async testAlerts() {
    logger.info('Testing alert system...');
    
    await this.sendAlert(
      'Alert System Test',
      'This is a test alert to verify the notification system is working correctly.',
      'normal'
    );
  }
}

// Create singleton instance
const alertManager = new AlertManager();

module.exports = alertManager;