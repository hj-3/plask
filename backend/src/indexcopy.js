require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const authMiddleware = require('./middlewares/auth');

app.use('/health',      require('./routes/health'));
app.use('/auth',        require('./routes/auth'));
app.use('/courses',     require('./routes/courses'));
app.use('/enrollments', authMiddleware, require('./routes/enrollments'));
app.use('/requests',    authMiddleware, require('./routes/requests'));

const PORT = parseInt(process.env.PORT || '3001', 10);

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
