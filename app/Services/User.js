'use strict'

const User = use('App/Models/User');
const bcrypt = require('bcryptjs');
const { omit } = require('lodash');
const FieldValidator = use('App/Validators/ValidateFields')();
const AuthUtils = use('App/Utils/Auth')();

module.exports = () => {
	const isValidFields = data => {
		if (!FieldValidator.isValidStringLength(data.name)) {
			return false;
		}

		if (!FieldValidator.isValidEmail(data.email)) {
			return false;
		}

		if (!FieldValidator.isValidCpf(data.cpf)) {
			return false;
		}

		if (!FieldValidator.isValidStringLength(data.password, 6, 255)) {
			return false;
		}

		const isValidBorn = !data.born || FieldValidator.isValidDate(data.born, {
			before: true,
			pattern: 'YYYY-MM-DD'
		});

		if (!isValidBorn) {
			return false;
		}

		return true;
	}

	const create = async data => {
		const isValid = isValidFields(data);

		if (!isValid) {
			return {
				error: true,
				message: 'INVALID_FIELDS'
			};
		}

		const emailInUse = await User.query()
			.where('email', data.email)
			.where('is_deleted', false)
			.first();

		if (emailInUse) {
			return {
				error: true,
				message: 'EMAIL_IN_USE'
			};
		}

		return User.create(data);
	};

	const login = async data => {
		if (!data.email || !FieldValidator.isValidEmail(data.email) || !data.password) {
			return {
				error: true,
				message: 'Invalid request parameters'
			};
		}

		const user = await User.query()
			.where('email', data.email)
			.select('id', 'name', 'email', 'cpf', 'born', 'gender', 'cellphone', 'landline_phone', 'password')
			.first();

		if (!user) {
			return {
				error: true,
				message: 'The user wasn\'t found.'
			}
		}

		const isSamePassword = bcrypt.compareSync(data.password, user.password);

		if (!isSamePassword) {
			return {
				error: true,
				message: 'Invalid credentials'
			};
		}

		const info = omit(user.toJSON(), ['password']);

		return {
			...info,
			token: AuthUtils.encodeData(info)
		};
	};

	const find = filter => {
		return User.query()
			.where('id', filter.id)
			.where('is_deleted', false)
			.select('id', 'name', 'email', 'cpf', 'born', 'gender', 'cellphone', 'landline_phone')
			.first();
	}

	return {
		create,
		find,
		login
	}
};
