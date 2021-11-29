'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class OrderProduct extends Model {
	static get table() {
		return 'order_products'
	}

	static boot () {
    	super.boot()
  	}

	orders () {
		return this.belongsTo('App/Models/Order', null, 'order_id');
	}
}

module.exports = OrderProduct
