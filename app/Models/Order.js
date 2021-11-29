'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Order extends Model {
	static get table() {
		return 'orders'
	}

	static boot () {
    	super.boot()
  	}

	orderDeliveries () {
		return this.hasOne('App/Models/OrderDeliveryInfo', null, 'order_id');
	}

	orderContacts () {
		return this.hasOne('App/Models/OrderContact', null, 'order_id');
	}

	orderProducts () {
		return this.hasMany('App/Models/OrderProduct', null, 'order_id');
	}
}

module.exports = Order
