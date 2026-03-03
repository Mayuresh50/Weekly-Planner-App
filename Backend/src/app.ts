import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { globalErrorHandler } from './middleware/error.middleware';
import { restrictToWorkingHours } from './middleware/time.middleware';

import authRoutes from './routes/auth.routes';
import backlogRoutes from './routes/backlog.routes';
import planningRoutes from './routes/planning.routes';
import assignmentRoutes from './routes/assignment.routes';
import dashboardRoutes from './routes/dashboard.routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger';

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Apply time restriction to all non-GET requests
app.use(restrictToWorkingHours);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/backlog', backlogRoutes);
app.use('/api/v1/planning', planningRoutes);
app.use('/api/v1/assignment', assignmentRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling
app.use(globalErrorHandler);

export default app;
