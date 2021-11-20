module.exports = () => {
	const handleException = code => {
		return {
			code,
			skip_log: true
		};
	};

	const handleResponse = (response, data, status) => {
		status = status || data.error && '500';

		return response.status(status || 200).send({
			status: 'success',
			data: data
		});
	};

	const handleError = (response, error) => {
        const status = error && error.status || 500;
        const code = error && error.code || 'error';
		const message = error && error.message || 'Something terrible happened!';

		return response.status(status).send({
			status: status,
			code: code,
			message: message
		});
	};

	return {
		handleException,
		handleResponse,
		handleError
	};
};
