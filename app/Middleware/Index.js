const AuthUtils = use('App/Utils/Auth')();

module.exports = () => {
	const Auth = ({ request, response }, next) => {
		const url = request.url();
		const token = request.qs.token;
		const decoded = AuthUtils.decodeToken(token);

		if (!decoded || !decoded.id) {
			return (url !== '/order' ? response.status(401).json({
				status: 'error',
				message: 'Invalid token.'
			}) : next());
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
