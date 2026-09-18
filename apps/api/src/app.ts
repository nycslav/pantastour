import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { destinationRouter } from './modules/destinations/destination.route';
import { itineraryRouter } from './modules/itineraries/itinerary.route';

export const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use('/destinations', destinationRouter);
app.use('/itineraries', itineraryRouter);

app.use((_request, response) => {
  response.status(404).json({
    error: { code: 'ROUTE_NOT_FOUND', message: 'The requested API route does not exist.' },
  });
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'The request contains invalid values.',
        issues: error.issues,
      },
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'The server could not complete the request.' },
  });
};

app.use(errorHandler);
