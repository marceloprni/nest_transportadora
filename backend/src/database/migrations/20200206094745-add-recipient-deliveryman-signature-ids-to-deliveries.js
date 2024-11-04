module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('deliveries', 'recipient_id', {
      type: Sequelize.INTEGER,
      references: { model: 'recipients', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    });

    queryInterface.addColumn('deliveries', 'deliveryman_id', {
      type: Sequelize.INTEGER,
      references: { model: 'deliverymen', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    });

    return queryInterface.addColumn('deliveries', 'signature_id', {
      type: Sequelize.INTEGER,
      references: { model: 'files', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    });
  },

  down: queryInterface => {
    queryInterface.removeColumn('deliveries', 'recipient_id');
    queryInterface.removeColumn('deliveries', 'deliveryman_id');
    return queryInterface.removeColumn('deliveries', 'signature_id');
  },
};
