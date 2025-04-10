require('dotenv').config();

const app = require('./src/app');
require('./src/config/db');
const { initReminderEngine } = require('./src/utils/reminderService');

// Default to 8000 to align with the frontend Axios baseURL
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initReminderEngine();
});