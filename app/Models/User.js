'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

class User extends Model {
  	static boot () {
    	super.boot()

		this.addHook('beforeCreate', async userInstance => {
			console.log(userInstance, 'user instance');

			if (userInstance.dirty.password) {
				userInstance.password = await Hash.make(userInstance.password)
			}
		})
  	}

	tokens () {
		return this.hasMany('App/Models/Token')
	}

	addresses () {
		return this.hasMany('App/Models/Address')
	}
}

module.exports = User
