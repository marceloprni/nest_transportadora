import * as Yup from 'yup';

import { Op } from 'sequelize';
import { parseISO, getHours, startOfDay, endOfDay } from 'date-fns';

import File from '../models/File';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

class DeliverymanDeliveryController {
  async index(req, res) {
    const { id } = req.params;
    const { delivered = false, page = 1, limit = 20 } = req.query;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(400).json({ error: "deliveryman doesn't exists" });
    }

    const deliveries = await Delivery.findAndCountAll({
      where: {
        deliveryman_id: id,
        canceled_at: null,
        end_date: delivered === 'true' ? { [Op.ne]: null } : { [Op.eq]: null },
      },
      attributes: [
        'id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
        'status',
      ],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'name', 'path', 'url'],
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
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'complement',
            'city',
            'state',
            'postcode',
          ],
        },
      ],
      limit,
      offset: (page - 1) * limit,
      order: [['created_at', 'DESC']],
    });

    return res.json(deliveries);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.number().when('end_date', (endDate, field) =>
        endDate ? field.required() : field
      ),
    });

    console.log(req.body);

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const { deliverymanId, deliveryId } = req.params;

    const deliveryman = await Deliveryman.findByPk(deliverymanId);

    if (!deliveryman) {
      return res.status(400).json({ error: "deliveryman doesn't exists" });
    }

    const delivery = await Delivery.findByPk(deliveryId);

    if (!delivery) {
      return res.status(400).json({ error: "delivery doesn't exists" });
    }

    const {
      start_date: startDate,
      end_date: endDate,
      signature_id: signatureId,
    } = req.body;

    if (startDate) {
      if (delivery.start_date) {
        return res
          .status(400)
          .json({ error: 'delivery has already been withdraw' });
      }

      const parsedStartDate = parseISO(startDate);

      const hour = getHours(parsedStartDate);

      if (hour <= 8 || hour >= 18) {
        return res
          .status(400)
          .json({ error: 'start date must be between 08:00 and 18:00' });
      }

      const withdrawnDeliveries = await Delivery.findAndCountAll({
        where: {
          deliveryman_id: deliverymanId,
          canceled_at: null,
          start_date: {
            [Op.between]: [
              startOfDay(parsedStartDate),
              endOfDay(parsedStartDate),
            ],
          },
        },
      });

      if (withdrawnDeliveries.count >= 5) {
        return res
          .status(400)
          .json({ error: 'deliveryman can only make 5 deliveries per day' });
      }

      await delivery.update({ start_date: parsedStartDate });

      return res.json(delivery);
    }

    if (delivery.end_date || delivery.canceled_at) {
      return res
        .status(400)
        .json({ error: 'delivery has already been closed' });
    }

    const parsedEndDate = parseISO(endDate);

    const file = await File.findByPk(signatureId);

    if (!file) {
      return res.status(400).json({ error: "signature doesn't exists" });
    }

    await delivery.update({
      end_date: parsedEndDate,
      signature_id: signatureId,
    });

    return res.json(delivery);
  }
}

export default new DeliverymanDeliveryController();
