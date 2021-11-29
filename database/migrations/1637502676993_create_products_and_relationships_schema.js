'use strict'

const Schema = use('Schema')

class UserSchema extends Schema {
	up () {
		this.create('product_categories', table => {
			table.increments('id').primary();

			table.string('name').notNullable();
			table.boolean('is_deleted').notNullable().defaultTo(false);

			table.timestamps(true, true);
		});

		this.create('products', table => {
			table.increments('id').primary();

			table.string('name').notNullable();
			table.text('slug').notNullable();

			table.integer('product_category_id').notNullable()
				.references('product_categories.id')
				.onDelete('CASCADE')
				.notNullable();

			table.float('price').notNullable();
			table.boolean('is_deleted').notNullable().defaultTo(false);

			table.timestamps(true, true);
		});

		this.create('product_colors', table => {
			table.increments('id').primary();

			table.string('name').notNullable();
			table.string('background').notNullable();
			table.boolean('is_deleted').notNullable().defaultTo(false);

			table.timestamps(true, true);
		});

		this.create('product_sizes', table => {
			table.increments('id').primary();

			table.string('name').notNullable();
			table.boolean('is_deleted').notNullable().defaultTo(false);

			table.timestamps(true, true);
		});

		this.create('product_table_prices', table => {
			table.increments('id').primary();

			table.integer('product_id').notNullable()
				.references('products.id')
				.onDelete('CASCADE')
				.notNullable();

			table.float('price').notNullable();

			table.date('end_date').notNullable();
			table.boolean('is_deleted').notNullable().defaultTo(false);

			table.timestamps(true, true);
		});

		this.create('product_branches', table => {
			table.increments('id').primary();

			table.integer('product_id').notNullable()
				.references('products.id')
				.onDelete('CASCADE')
				.notNullable();

			table.integer('days_to_produce').nullable();

			table.integer('product_color_id').notNullable()
				.references('product_colors.id')
				.onDelete('CASCADE')
				.notNullable();

			table.string('name').notNullable();
			table.text('thumb_url').notNullable();
			table.boolean('is_deleted').notNullable().defaultTo(false);

			table.timestamps(true, true);
		});

		this.create('product_branch_sizes', table => {
			table.increments('id').primary();

			table.integer('quantity').notNullable().defaultTo(0);

			table.integer('product_id').notNullable()
				.references('products.id')
				.onDelete('CASCADE')
				.notNullable();

			table.integer('product_branch_id').notNullable()
				.references('product_branches.id')
				.onDelete('CASCADE')
				.notNullable();

			table.integer('product_size_id').notNullable()
				.references('product_sizes.id')
				.onDelete('CASCADE')
				.notNullable();

				table.boolean('is_deleted').notNullable().defaultTo(false);

			table.timestamps(true, true);
		});
	}

	down () {
		this.drop('product_branch_sizes');
		this.drop('product_branches');
		this.drop('product_table_prices');
		this.drop('product_sizes');
		this.drop('product_colors');
		this.drop('products');
		this.drop('product_categories');
	}
}

module.exports = UserSchema
