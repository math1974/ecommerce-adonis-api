'use strict'

const Schema = use('Schema')

class AddressesSchema extends Schema {
	up () {
		this.create('addresses', table => {
			table.increments().primary();
			table.string('street').notNullable();
			table.string('number').notNullable();
			table.string('neighborhood').notNullable();
			table.string('city').notNullable();
			table.string('state').notNullable();
			table.string('complement', 500).nullable();
			table.string('cep', 8).nullable();

			table.integer('user_id')
				.references('users.id')
				.onDelete('CASCADE')
				.notNullable();

			table.boolean('is_deleted').notNullable().defaultTo(false);

			table.timestamps()
		})
	}

	down () {
		this.drop('addresses')
	}
}

module.exports = AddressesSchema
