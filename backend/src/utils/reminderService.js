const db = require('../config/db');
const { sendEmail } = require('./emailService');

/**
 * Core Reminder Engine
 * Scans the database for upcoming medical or vaccination reminders that are due.
 * Dispatches notification emails and updates the reminder sent_status upon success.
 */
const checkAndSendReminders = async () => {
    try {
        const [reminders] = await db.query(
            `SELECT r.*, p.pet_name, u.email, up.first_name
             FROM reminders r
             JOIN pets p ON r.pet_id = p.pet_id
             JOIN clients c ON p.client_id = c.client_id
             JOIN users u ON c.user_id = u.user_id
             LEFT JOIN user_profiles up ON u.user_id = up.user_id
             WHERE r.due_date <= CURDATE() AND r.sent_status = 0`
        );

        if (reminders.length === 0) {
            return;
        }

        for (const reminder of reminders) {
            const name = reminder.first_name || "Pet Parent";
            const subject = `Upcoming ${reminder.reminder_type} for ${reminder.pet_name} 🐾`;
            const text = `Dear ${name},

This is a friendly reminder from PetPaws Hospital.

Your pet, ${reminder.pet_name}, has a ${reminder.reminder_type} due.
Details: ${reminder.message || "Please visit us soon."}
Due Date: ${new Date(reminder.due_date).toLocaleDateString()}

Please contact us or use the client portal to book an appointment.

Warm regards,
PetPaws Animal Hospital`;

            await sendEmail(reminder.email, subject, text);

            await db.query(
                'UPDATE reminders SET sent_status = 1 WHERE reminder_id = ?',
                [reminder.reminder_id]
            );
        }

    } catch (error) {
        console.error("Reminder Engine Evaluation Error:", error);
    }
};

/**
 * Initializes the background execution loop for the reminder engine.
 * Typically invoked once during application startup.
 */
const initReminderEngine = () => {
    checkAndSendReminders();
    
    const intervalMs = Number(process.env.REMINDER_INTERVAL_HOURS || 12) * 60 * 60 * 1000;
    setInterval(checkAndSendReminders, intervalMs);
};

module.exports = { initReminderEngine, checkAndSendReminders };
