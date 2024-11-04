import * as Yup from 'yup';
import { Op } from 'sequelize';

import File from '../models/File';
import Deliveryman from '../models/Deliveryman';

class DeliverymanController {
  async index(req, res) {
    const { q = '', page = 1, limit = 20 } = req.query;

    const deliverymen = await Deliveryman.findAndCountAll({
      where: {
        name: {
          [Op.iLike]: `${q}%`,
        },
      },
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
      limit,
      offset: (page - 1) * limit,
      order: [['created_at', 'DESC']],
    });

    res.json(deliverymen);
  }

  async show(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id, {
      attributes: ['id', 'name', 'email', 'created_at'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });

    res.json(deliveryman);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string()
        .required()
        .min(1)
        .max(255),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const { id, name, email } = await Deliveryman.create(req.body);

    return res.json({ id, name, email });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string()
        .min(1)
        .max(255),
      email: Yup.string().email(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const { avatar_id } = req.body;
    if (avatar_id) {
      const file = await File.findByPk(avatar_id);

      if (!file) {
        return res.status(400).json({ error: "file doesn't exists" });
      }
    }

    const deliveryman = await Deliveryman.findByPk(req.params.id);

    if (!deliveryman) {
      return res.status(400).json({ error: "deliveryman doesn't exists" });
    }

    const { id, name, email } = await deliveryman.update(req.body);

    return res.json({ id, name, email });
  }

  async destroy(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.id);

    if (!deliveryman) {
      return res.status(400).json({ error: "deliveryman doesn't exists" });
    }

    await deliveryman.destroy();

    return res.json({ message: 'OK' });
  }
}

export default new DeliverymanController();
