const express = require('express');
const userMiddleware = require('../middleware/userMiddleware');
const {
    getReflections,
    createReflection,
    importReflections,
    updateReflection,
    markReviewed,
    snoozeReflection,
    deleteReflection,
} = require('../controllers/reflection');

const reflectionRouter = express.Router();
reflectionRouter.use(userMiddleware);
reflectionRouter.get('/reflections', getReflections);
reflectionRouter.post('/reflections', createReflection);
reflectionRouter.post('/reflections/import', importReflections);
reflectionRouter.patch('/reflections/:id', updateReflection);
reflectionRouter.post('/reflections/:id/reviewed', markReviewed);
reflectionRouter.post('/reflections/:id/snooze', snoozeReflection);
reflectionRouter.delete('/reflections/:id', deleteReflection);

module.exports = reflectionRouter;
