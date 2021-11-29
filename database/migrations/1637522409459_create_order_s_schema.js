'use strict'

const Schema = use('Schema')

class UserSchema extends Schema {
	up () {
		this.create('orders', table => {
			table.increments('id').primary();

			table.string('type', 10).notNullable(); // [SALE, BAG]
			table.text('code').nullable();
			table.string('status').notNullable();
			table.boolean('online_payment').defaultTo(false);
			table.float('price').notNullable().defaultTo(0);
			table.float('delivery_price').notNullable().defaultTo(0);

			table.integer('user_id')
				.references('users.id')
				.onDelete('CASCADE')
				.nullable();

			table.integer('days_to_produce').notNullable().defaultTo(0);
			table.integer('delivery_days').notNullable().defaultTo(0);
			table.integer('total_days_to_deliver').notNullable().defaultTo(0);

			table.boolean('is_deleted').notNullable().defaultTo(false);

			table.timestamps(true, true);
		});

		this.create('order_products', table => {
			table.increments('id').primary();

			table.string('type', 10).notNullable(); // [SALE, BAG]
			table.float('price').notNullable().defaultTo(0);

			table.integer('user_id')
				.references('users.id')
				.onDelete('CASCADE')
				.nullable();

			table.integer('product_id')
				.references('products.id')
				.onDelete('CASCADE')
				.notNullable();

			table.integer('product_branch_id')
				.references('product_branches.id')
				.onDelete('CASCADE')
				.notNullable();

			table.integer('product_size_id')
				.references('product_sizes.id')
				.onDelete('CASCADE')
				.notNullable();

			table.integer('order_id')
				.references('orders.id')
				.onDelete('CASCADE')
				.notNullable();

			table.boolean('is_deleted').notNullable().defaultTo(false);

			table.timestamps(true, true);
		});

		this.create('order_deliveries_infos', table => {
			table.increments('id').primary();

			table.text('address').notNullable();
			table.string('cep').notNullable();
			table.string('number').notNullable();
			table.text('complement').notNullable();
			table.string('neighborhood').notNullable();
			table.string('city').notNullable();
			table.string('state').notNullable();
			table.integer('order_id')
				.references('orders.id')
				.onDelete('CASCADE')
				.notNullable();

			table.timestamps(true, true);
		});

		this.create('order_contacts', table => {
			table.increments('id').primary();

			table.string('name').notNullable();
			table.string('email').notNullable();
			table.string('cellphone', 13).notNullable();

			table.text('cpf', 11).notNullable();

			table.integer('order_id')
				.references('orders.id')
				.onDelete('CASCADE')
				.notNullable();

			table.timestamps(true, true);
		});
	}

	down () {
		this.drop('order_contacts');
		this.drop('order_deliveries_infos');
		this.drop('order_products');
		this.drop('orders');
	}
}

module.exports = UserSchema
