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

	const isValidCpf = number => {
		const BLACKLIST = ['00000000000', '11111111111', '22222222222', '33333333333', '44444444444', '55555555555', '66666666666',
		'77777777777', '88888888888', '99999999999', '12345678909'];

		const stripped = strip(number);

		if (!stripped || stripped.length !== 11 || BLACKLIST.indexOf(stripped) >= 0) {
			return false;
		}

		let numbers = stripped.substr(0, 9);

		numbers += verifierDigit(numbers);
		numbers += verifierDigit(numbers);

		return numbers.substr(-2) === stripped.substr(-2);
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
		isValidDate
	}
};
