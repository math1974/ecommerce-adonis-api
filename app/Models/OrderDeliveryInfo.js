'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class OrderDeliveryInfo extends Model {
	static get table() {
		return 'order_deliveries_infos'
	}

	static boot () {
    	super.boot()
  	}

	orders () {
		return this.belongsTo('App/Models/Order', null, 'order_id');
	}
}

module.exports = OrderDeliveryInfo
