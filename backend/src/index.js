require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { initDB } = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// 라우트
app.use('/health',      require('./routes/health'));
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/courses',     require('./routes/courses'));
app.use('/api/enrollments', require('./middlewares/auth'), require('./routes/enroll'));
app.use('/api/requests',    require('./middlewares/auth'), require('./routes/requests'));

const PORT = parseInt(process.env.PORT || '3001', 10);

const start = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('[STARTUP ERROR]', err);
    process.exit(1);
  }
};

start();
