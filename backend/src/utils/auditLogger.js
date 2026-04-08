const db = require('../config/db');

/**
 * System-wide Audit Logger
 * @param {number} userId - The user performing the action
 * @param {string} action - e.g. "UPDATE_PET", "CREATE_DIAGNOSIS", "PROCESS_PAYMENT"
 * @param {string} entity - e.g. "pet", "medical_record", "invoice"
 * @param {number} entityId - The ID of the affected entity
 * @param {object} oldValue - (Optional) The state before the change
 * @param {object} newValue - (Optional) The state after the change
 */
const logAction = async (userId, action, entity, entityId, oldValue = null, newValue = null) => {
    try {
        await db.query(
            `INSERT INTO audit_logs (user_id, action, entity, entity_id, old_value, new_value)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userId, 
                action, 
                entity, 
                entityId, 
                oldValue ? JSON.stringify(oldValue) : null, 
                newValue ? JSON.stringify(newValue) : null
            ]
        );
    } catch (error) {
        console.error("Audit log failed:", error);
        // We don't throw here to avoid breaking the main transaction, 
        // but in a production app, this might be handled via a background queue.
    }
};

module.exports = { logAction };
