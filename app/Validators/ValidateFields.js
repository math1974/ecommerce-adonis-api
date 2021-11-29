const moment = require('moment');

module.exports = () => {
	const isValidStringLength = (value, minLength = 1, maxLength = 255) => {
		if (!value || value.length < minLength || value.length > maxLength) {
			return false;
		}

		return true;
	};

	const isValidEmail = email => {
		const regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		return email && regexp.test(String(email).toLowerCase());
	};

	const isValidPhoneNumber = number => {
		return number && number.match(/\d+/g).join('').length === 11
	};

	const isValidCpf = cpf => {
		let sum = 0;
		let rest;

		if (['00000000000', '11111111111', '22222222222', '33333333333', '44444444444', '55555555555', '66666666666',
			'77777777777', '88888888888', '99999999999'].includes(cpf)) {
			return false;
		}
		for (let i = 1; i <= 9; i++) {
			sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
		};

		rest = (sum * 10) % 11;

		if ((rest == 10) || (rest == 11)) {
			rest = 0;
		};

		if (rest !== parseInt(cpf.substring(9, 10))) {
			return false;
		};

		sum = 0;

		for (let i = 1; i <= 10; i++) {
			sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
		};

		rest = (sum * 10) % 11;

		if ((rest == 10) || (rest == 11)) {
			rest = 0;
		};

		if (rest !== parseInt(cpf.substring(10, 11))) {
			return false
		};

		return true;
	};

	const isValidDate = (date, options = {}) => {
		const pattern = options.pattern || 'YYYY-MM-DD';
		const today = moment().format(pattern);
		const momentFunction = options.before ? 'isBefore' : options.after ? 'isAfter' : '';

		if (momentFunction) {
			if (moment(date, pattern)[momentFunction](today)) {
				return true;
			}

			return false;
		}

		return moment(date, pattern).isValid();
	};

	return {
		isValidCpf,
		isValidEmail,
		isValidStringLength,
		isValidDate,
		isValidPhoneNumber
	}
};
