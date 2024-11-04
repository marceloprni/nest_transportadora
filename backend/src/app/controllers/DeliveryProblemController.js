import * as Yup from 'yup';

import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblem';

class DeliveryProblemController {
  async index(req, res) {
    const { page = 1, limit = 20 } = req.query;

    const deliveryProblems = await DeliveryProblem.findAndCountAll({
      attributes: ['id', 'description', 'created_at'],
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id'],
        },
      ],
      limit,
      offset: (page - 1) * limit,
      order: [['created_at', 'DESC']],
    });

    res.json(deliveryProblems);
  }

  async show(req, res) {
    const { deliveryId } = req.params;

    const deliveryProblems = await DeliveryProblem.findAll({
      where: {
        delivery_id: deliveryId,
      },
      attributes: ['id', 'description', 'created_at'],
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id'],
        },
      ],
    });

    res.json(deliveryProblems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const { deliveryId } = req.params;

    const delivery = await Delivery.findByPk(deliveryId, {
      attributes: ['id'],
    });

    if (!delivery) {
      return res.status(400).json({ error: "delivery doesn't exists" });
    }

    const { id } = await DeliveryProblem.create({
      ...req.body,
      delivery_id: deliveryId,
    });

    const deliveryProblem = await DeliveryProblem.findByPk(id, {
      attributes: ['id', 'description', 'created_at'],
    });

    res.json(deliveryProblem);
  }

  async destroy(req, res) {
    const { id } = req.params;

    const deliveryProblem = await DeliveryProblem.findByPk(id, {
      attributes: ['id'],
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id'],
        },
      ],
    });

    if (!deliveryProblem) {
      return res.status(400).json({ error: "delivery problem doesn't exists" });
    }

    const delivery = await Delivery.findByPk(deliveryProblem.deliveryId);

    if (!delivery) {
      return res.status(400).json({ error: "delivery doesn't exists" });
    }

    delivery.canceled_at = new Date();

    await delivery.save();

    await Queue.add(DeliveryCancellationMail.key, { delivery });

    return res.json({ message: 'OK' });
  }
}

export default new DeliveryProblemController();
