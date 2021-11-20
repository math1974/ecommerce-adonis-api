const AuthUtils = use('App/Utils/Auth')();

module.exports = () => {
	const Auth = ({ request, response }, next) => {
		const token = request.qs.token;
		const decoded = AuthUtils.decodeToken(token);

		if (!decoded || !decoded.id) {
			return response.status(401).json({
				status: 'error',
				message: 'Invalid token.'
			});
		}

		request.auth = {
			id: decoded.id
		};

		return next();
	};

	return {
		Auth
	}
};
