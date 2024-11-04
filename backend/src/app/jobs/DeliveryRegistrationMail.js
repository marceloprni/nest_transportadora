import Mail from '../../lib/Mail';

class DeliveryRegistrationMail {
  get key() {
    return 'DeliveryRegistrationMail';
  }

  async handle({ data }) {
    const { delivery } = data;

    await Mail.sendMail({
      to: `${delivery.deliveryman.name} <${delivery.deliveryman.email}>`,
      subject: 'Entrega cadastrada',
      template: 'delivery/registration',
      context: {
        deliveryman: delivery.deliveryman,
        recipient: delivery.recipient,
        product: delivery.product,
      },
    });
  }
}

export default new DeliveryRegistrationMail();
