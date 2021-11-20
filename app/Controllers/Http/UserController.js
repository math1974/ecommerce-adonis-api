'use strict'

const UserService = use('App/Services/User')();
const UtilsAPI = use('App/Utils/HandleAPI')();

class UserController {
    async create({ request, response }) {
		try {
			console.log(21312)
			const data = request.only([
				'name', 'email', 'password',
				'cpf', 'born', 'cellphone',
				'landline_phone', 'gender'
			]);

			const requestResponse = await UserService.create(data);

			return UtilsAPI.handleResponse(response, requestResponse);
		} catch (error) {
			return UtilsAPI.handleError(response, error);
		}
    }

	async find({ request, response }) {
		try {
			const data = {
				id: request.auth.id
			};

			const requestResponse = await UserService.find(data);

			return UtilsAPI.handleResponse(response, requestResponse);
		} catch (error) {
			return UtilsAPI.handleError(response, error);
		}
    }

	async login({ request, response }) {
		try {
			console.log(request);
			const data = request.only(['email', 'password']);

			const requestResponse = await UserService.login(data);

			return UtilsAPI.handleResponse(response, requestResponse);
		} catch (error) {
			return UtilsAPI.handleError(response, error);
		}
    }
}

module.exports = UserController;
