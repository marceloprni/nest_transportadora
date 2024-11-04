import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import DeliveryController from './app/controllers/DeliveryController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';
import DeliverymanDeliveryController from './app/controllers/DeliverymanDeliveryController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.get('/deliveries/:deliveryId/problems', DeliveryProblemController.show);
routes.post(
  '/deliveries/:deliveryId/problems',
  DeliveryProblemController.store
);

routes.get('/deliverymen/:id', DeliverymanController.show);

routes.get('/deliverymen/:id/deliveries', DeliverymanDeliveryController.index);
routes.put(
  '/deliverymen/:deliverymanId/deliveries/:deliveryId',
  DeliverymanDeliveryController.update
);

routes.post('/files', upload.single('file'), FileController.store);

routes.use(authMiddleware);

routes.get('/recipients', RecipientController.index);
routes.get('/recipients/:id', RecipientController.show);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.destroy);

routes.get('/deliverymen', DeliverymanController.index);
routes.post('/deliverymen', DeliverymanController.store);
routes.put('/deliverymen/:id', DeliverymanController.update);
routes.delete('/deliverymen/:id', DeliverymanController.destroy);

routes.get('/deliveries', DeliveryController.index);
routes.get('/deliveries/:id', DeliveryController.show);
routes.post('/deliveries', DeliveryController.store);
routes.put('/deliveries/:id', DeliveryController.update);
routes.delete('/deliveries/:id', DeliveryController.destroy);

routes.get('/problems', DeliveryProblemController.index);
routes.delete(
  '/problems/:id/cancel-delivery',
  DeliveryProblemController.destroy
);

export default routes;
