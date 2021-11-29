'use strict'

const OrderService = use('App/Services/Order')();
const UtilsAPI = use('App/Utils/HandleAPI')();

class OrderController {
    async create({ request, response }) {
		try {
			const filter = {
				user_id: request.auth?.id
			};
			const data = request.only([
				'id', // TYPE SALE AND THERE WAS A BAG CREATED FOR THAT USER.
				'type', 'status', 'delivery_days',
				'contact_info', 'delivery_info',
				'days_to_produce', 'total_days_to_deliver',
				'price', 'delivery_price', 'products', // = []
				'payment_type', // ['AVULSE', 'ONLINE']
				'creditcard_info' // only when is online: Object
			]);

			const requestResponse = await OrderService.create(data, filter);

			return UtilsAPI.handleResponse(response, requestResponse);
		} catch (error) {
			return UtilsAPI.handleError(response, error);
		}
    }

	async updateBag({ request, response }) {
		try {
			const filter = {
				user_id: request.auth.id,
				id: ~~request.params.id
			};

			if (!filter.id) {
				throw new Error();
			}

			const data = request.only([
				'action',
				'product', // {}
				'order_product_id'
			]);

			const requestResponse = await OrderService.updateBag(data, filter);

			return UtilsAPI.handleResponse(response, requestResponse);
		} catch (error) {
			return UtilsAPI.handleError(response, error);
		}
	}
}

module.exports = OrderController;
