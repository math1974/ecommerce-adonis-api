const jwt = require('jsonwebtoken');

module.exports = () => {
    const decodeToken = token => {
		if (!token) {
			return;
		}

		try {
			const data = jwt.verify(token, process.env.ENCRYPTION_KEY);

			return data;
		} catch (error) {
			return null;
		}
	};

    const encodeData = (data, expiresIn) => {
		if (!data) {
			return;
		}

		return jwt.sign(data, process.env.ENCRYPTION_KEY, {
			expiresIn: expiresIn || '24h'
		});
	};

    return {
		decodeToken,
		encodeData
	};
}
