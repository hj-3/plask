require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/health',      require('./routes/health'));
app.use('/courses',     require('./routes/courses'));
app.use('/enrollments', require('./routes/enrollments'));
app.use('/requests',    require('./routes/requests'));

const PORT = parseInt(process.env.PORT || '3001', 10);

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
