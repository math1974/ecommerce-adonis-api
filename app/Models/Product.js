'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Product extends Model {
	static get table() {
		return 'products'
	}

	static boot () {
    	super.boot()
  	}
}

module.exports = Product
