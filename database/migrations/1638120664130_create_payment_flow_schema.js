'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreatePaymentFlowSchema extends Schema {
	up () {
		this.create('order_payments', table => {
			table.increments('id')

			table.string('first_card_numbers', 4).notNullable();

			table.string('last_card_numbers', 4).notNullable();

			table.float('price').notNullable();

			table.integer('installments').notNullable();

			table.integer('order_id')
				.references('orders.id')
				.onDelete('CASCADE')
				.notNullable();

			table.boolean('is_deleted').defaultTo(false).notNullable();

			table.timestamps(true, true);
		});
	}

	down () {
		this.drop('order_payments');
	}
}

module.exports = CreatePaymentFlowSchema
