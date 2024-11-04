import * as Yup from 'yup';
import { Op } from 'sequelize';

import File from '../models/File';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';

import Queue from '../../lib/Queue';
import DeliveryRegistrationMail from '../jobs/DeliveryRegistrationMail';
import DeliveryCancellationMail from '../jobs/DeliveryCancellationMail';

const findConfig = {
  attributes: [
    'id',
    'product',
    'start_date',
    'end_date',
    'canceled_at',
    'status',
  ],
  include: [
    {
      model: Recipient,
      as: 'recipient',
      attributes: [
        'id',
        'name',
        'street',
        'number',
        'complement',
        'state',
        'city',
        'postcode',
      ],
    },
    {
      model: Deliveryman,
      as: 'deliveryman',
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    },
    {
      model: File,
      as: 'signature',
      attributes: ['id', 'name', 'path', 'url'],
    },
  ],
};

class DeliveryController {
  async index(req, res) {
    const { q = '', page = 1, limit = 20 } = req.query;

    const deliveries = await Delivery.findAndCountAll({
      where: {
        canceled_at: null,
        product: {
          [Op.iLike]: `${q}%`,
        },
      },
      ...findConfig,
      limit,
      offset: (page - 1) * limit,
      order: [['created_at', 'DESC']],
    });

    res.json(deliveries);
  }

  async show(req, res) {
    const { id } = req.params;

    const delivery = await Delivery.findByPk(id, findConfig);

    res.json(delivery);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number()
        .positive()
        .required(),
      deliveryman_id: Yup.number()
        .positive()
        .required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const deliveryExists = await Delivery.findOne({
      where: {
        recipient_id,
        deliveryman_id,
        product,
        canceled_at: null,
      },
    });

    if (deliveryExists) {
      return res.status(400).json({ error: 'delivery already exists' });
    }

    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient) {
      return res.status(400).json({ error: "recipient doesn't exists" });
    }

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: "deliveryman doesn't exists" });
    }

    const { id } = await Delivery.create(req.body);

    const delivery = await Delivery.findByPk(id, findConfig);

    await Queue.add(DeliveryRegistrationMail.key, { delivery });

    return res.json(delivery);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().positive(),
      deliveryman_id: Yup.number().positive(),
      product: Yup.string(),
      signature_id: Yup.number().positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const { recipient_id, deliveryman_id, signature_id } = req.body;

    const delivery = await Delivery.findByPk(req.params.id, findConfig);

    if (!delivery) {
      return res.status(400).json({ error: "delivery doesn't exists" });
    }

    if (recipient_id) {
      const recipient = await Recipient.findByPk(recipient_id);

      if (!recipient) {
        return res.status(400).json({ error: "recipient doesn't exists" });
      }

      if (delivery.recipient.id !== recipient_id) {
        return res
          .status(400)
          .json({ error: "doesn't allowed change recipient" });
      }
    }

    if (deliveryman_id) {
      const deliveryman = await Deliveryman.findByPk(deliveryman_id);

      if (!deliveryman) {
        return res.status(400).json({ error: "deliveryman doesn't exists" });
      }

      if (delivery.deliveryman.id !== deliveryman_id) {
        return res
          .status(400)
          .json({ error: "doesn't allowed change deliveryman" });
      }
    }

    if (signature_id) {
      const signature = await File.findByPk(signature_id);

      if (!signature) {
        return res.status(400).json({ error: "signature doesn't exists" });
      }
    }

    await delivery.update(req.body);

    return res.json(delivery);
  }

  async destroy(req, res) {
    const delivery = await Delivery.findByPk(req.params.id, findConfig);

    if (!delivery) {
      return res.status(400).json({ error: "delivery doesn't exists" });
    }

    delivery.canceled_at = new Date();

    await delivery.save();

    await Queue.add(DeliveryCancellationMail.key, { delivery });

    return res.json(delivery);
  }
}

export default new DeliveryController();
