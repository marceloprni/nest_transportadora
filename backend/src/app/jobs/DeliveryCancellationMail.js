import Mail from '../../lib/Mail';

class DeliveryCancellationMail {
  get key() {
    return 'DeliveryCancellationMail';
  }

  async handle({ data }) {
    const { delivery } = data;

    await Mail.sendMail({
      to: `${delivery.deliveryman.name} <${delivery.deliveryman.email}>`,
      subject: 'Entrega cancelada',
      template: 'delivery/cancellation',
      context: {
        deliveryman: delivery.deliveryman,
        recipient: delivery.recipient,
        product: delivery.product,
      },
    });
  }
}

export default new DeliveryCancellationMail();
