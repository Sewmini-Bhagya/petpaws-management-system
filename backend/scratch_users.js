const db = require('./src/config/db');

async function main() {
  try {
    const [users] = await db.query('SELECT user_id, email, role_id FROM users');
    console.log('USERS IN DB:');
    console.table(users);

    const [profiles] = await db.query('SELECT user_id, first_name, last_name FROM user_profiles');
    console.log('PROFILES IN DB:');
    console.table(profiles);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    process.exit(0);
  }
}

main();
