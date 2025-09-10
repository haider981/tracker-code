const cron = require('node-cron');
const { autoAssignLeaveForAllEmployees } = require('../controllers/scheduledJobController');

/**
 * Initialize all scheduled jobs
 */
const initializeScheduledJobs = () => {
  console.log('Initializing scheduled jobs...');

  // Schedule auto-leave assignment at 22:30 (10:30 PM) every day
  // Cron format: second minute hour day month dayOfWeek
  // '0 30 22 * * *' = At 22:30:00 every day
  const autoLeaveJob = cron.schedule('0 30 22 * * *', async () => {
    console.log('🕙 Running scheduled auto-leave assignment at 22:30...');
    
    try {
      const result = await autoAssignLeaveForAllEmployees();
      
      if (result.success) {
        console.log('✅ Auto-leave assignment completed:', {
          processed: result.processed,
          inserted: result.inserted,
          message: result.message
        });
      } else {
        console.error('❌ Auto-leave assignment failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Scheduled auto-leave assignment error:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Set your timezone here
  });

  // Optional: Add a test job that runs every minute for debugging
  // Remove this in production
  const testJob = cron.schedule('*/1 * * * *', async () => {
    console.log('🧪 Test job running every minute - Current time:', new Date().toISOString());
  }, {
    scheduled: false // Disabled by default
  });

  console.log('📅 Scheduled jobs initialized:');
  console.log('   - Auto-leave assignment: Every day at 22:30 IST');
  console.log('   - Test job: Disabled (can be enabled for debugging)');

  return {
    autoLeaveJob,
    testJob,
    // Method to start test job for debugging
    startTestJob: () => {
      console.log('🧪 Starting test job for debugging...');
      testJob.start();
    },
    // Method to stop test job
    stopTestJob: () => {
      console.log('🛑 Stopping test job...');
      testJob.stop();
    }
  };
};

/**
 * Stop all scheduled jobs (useful for graceful shutdown)
 */
const stopAllScheduledJobs = () => {
  console.log('🛑 Stopping all scheduled jobs...');
  cron.getTasks().forEach((task, name) => {
    task.stop();
    console.log(`   - Stopped job: ${name}`);
  });
};

module.exports = {
  initializeScheduledJobs,
  stopAllScheduledJobs
};