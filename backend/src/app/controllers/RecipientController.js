import * as Yup from 'yup';
import { Op } from 'sequelize';

import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const { q = '', page = 1, limit = 20 } = req.query;

    const recipients = await Recipient.findAndCountAll({
      where: {
        name: {
          [Op.iLike]: `${q}%`,
        },
      },
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
      limit,
      offset: (page - 1) * limit,
      order: [['created_at', 'DESC']],
    });

    res.json(recipients);
  }

  async show(req, res) {
    const { id } = req.params;

    const recipient = await Recipient.findByPk(id, {
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
    });

    res.json(recipient);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      complement: Yup.string(),
      city: Yup.string().required(),
      state: Yup.string().required(),
      postcode: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const {
      id,
      name,
      street,
      number,
      complement,
      city,
      state,
      postcode,
    } = await Recipient.create(req.body);

    return res.json({
      id,
      name,
      street,
      number,
      complement,
      city,
      state,
      postcode,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      complement: Yup.string().required(),
      city: Yup.string().required(),
      state: Yup.string().required(),
      postcode: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const recipient = await Recipient.findByPk(req.params.id);

    if (!recipient) {
      return res.status(400).json({ error: "Recipient doesn't exists" });
    }

    const {
      name,
      street,
      number,
      complement,
      city,
      state,
      postcode,
    } = await recipient.update(req.body);

    return res.json({
      name,
      street,
      number,
      complement,
      city,
      state,
      postcode,
    });
  }

  async destroy(req, res) {
    const recipient = await Recipient.findByPk(req.params.id);

    if (!recipient) {
      return res.status(400).json({ error: "recipient doesn't exists" });
    }

    await recipient.destroy();

    return res.json({ message: 'OK' });
  }
}

export default new RecipientController();
