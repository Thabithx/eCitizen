const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectdb = require('./config/dbconfig');

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

async function startServer() {
  await connectdb();

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
  });

  const PORT = process.env.PORT || 3030;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
