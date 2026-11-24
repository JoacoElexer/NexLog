const express = require('express');

const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

function routerApi(app) {
  app.use('/api', apiRouter);
}

module.exports = routerApi;
