'use strict'

const Schema = use('Schema')

class UserSchema extends Schema {
	up () {
		this.create('users', table => {
			table.increments('id').primary();
			table.string('name').notNullable();
			table.string('email').notNullable();
			table.string('password').notNullable();
			table.string('cpf', 11).nullable();
			table.date('born', 10).nullable();
			table.string('cellphone', 13).nullable();
			table.string('landline_phone', 13).nullable();
			table.string('gender', 6).nullable();
			table.string('confirm_account_code', 6).nullable();
			table.text('confirm_account_token').nullable();
			table.boolean('is_deleted').notNullable().defaultTo(false);
			table.timestamps();
		})
	}

	down () {
		this.drop('users')
	}
}

module.exports = UserSchema
