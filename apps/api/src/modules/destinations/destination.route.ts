import { Router } from 'express';

import {
  getDestination,
  listDestinations,
  listNearbyDestinations,
} from './destination.controller';

export const destinationRouter = Router();

destinationRouter.get('/', listDestinations);
destinationRouter.get('/nearby', listNearbyDestinations);
destinationRouter.get('/:id', getDestination);
