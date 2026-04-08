const db = require('./src/config/db');

async function main() {
  try {
    const [apps] = await db.query('DESCRIBE appointments');
    console.log('APPOINTMENTS SCHEMA:');
    console.table(apps);

    const [feedback] = await db.query('DESCRIBE feedback');
    console.log('FEEDBACK SCHEMA:');
    console.table(feedback);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    process.exit(0);
  }
}

main();
