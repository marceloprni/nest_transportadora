import Sequelize, { Model } from 'sequelize';

class Delivery extends Model {
  static init(sequelize) {
    super.init(
      {
        product: Sequelize.STRING,
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
        canceled_at: Sequelize.DATE,
        status: {
          type: Sequelize.VIRTUAL,
          get() {
            if (this.canceled_at !== null) {
              return 'canceleda';
            }

            if (this.start_date === null) {
              return 'pendente';
            }

            if (this.start_date !== null && this.end_date === null) {
              return 'retirada';
            }

            if (this.start_date !== null && this.end_date !== null) {
              return 'entregue';
            }
          },
        },
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Recipient, {
      foreignKey: 'recipient_id',
      as: 'recipient',
    });
    this.belongsTo(models.Deliveryman, {
      foreignKey: 'deliveryman_id',
      as: 'deliveryman',
    });
    this.belongsTo(models.File, {
      foreignKey: 'signature_id',
      as: 'signature',
    });
  }
}

export default Delivery;
