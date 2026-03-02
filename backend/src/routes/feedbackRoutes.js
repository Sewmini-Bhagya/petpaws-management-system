const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { submitFeedback } = require('../controllers/feedbackController');

/**
 * Feedback Router
 * Restricts all actions to authenticated users with 'CLIENT' role.
 */
router.use(authMiddleware, roleMiddleware('CLIENT'));

router.post('/', submitFeedback);

module.exports = router;
