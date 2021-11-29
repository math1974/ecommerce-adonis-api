'use strict'

const request = require('request');
const async = require('async');
const Database = use('Database')

const Order = require("../Models/Order");
const OrderProduct = require("../Models/OrderProduct");
const OrderModel = use('App/Models/Order');
const OrderPaymentModel = use('App/Models/OrderPayment');
const OrderProductModel = use('App/Models/OrderProduct');
const OrderContactModel = use('App/Models/OrderContact');
const ProductModel = use('App/Models/Product');
const OrderDeliveryInfoModel = use('App/Models/OrderDeliveryInfo');

// Utils
const FieldValidator = use('App/Validators/ValidateFields')();
const eRedeEndpoint = 'https://api.userede.com.br/desenvolvedores/v1';
// const eRedeEndpoint = 'https://api.userede.com.br/erede/v1';

module.exports = () => {
	const mountOrderInfo = (data, filter) => {
		return {
			type: data.type, // [BAG, SALE]
			status: data.status, // [WAITING, CANCELED, PAID]
			online_payment: !!data.online_payment, // FALSE = 'AVULSE' SENÃO CREDITCARD
			price: data.price,
			delivery_price: data.delivery_price,
			user_id: filter.user_id || null,
			days_to_produce: data.days_to_produce,
			delivery_days: data.delivery_days,
			total_days_to_deliver: data.total_days_to_deliver
		};
	};

	const isValid = (data, collection) => {
		if (collection === 'orderInfo') {
			if (!data.type || !['SALE', 'BAG'].includes(data.type)) {
				return false;
			}

			if (!data.status) {
				return false;
			}

			if (!data.price && data.price !== 0) {
				return false;
			}
		}

		if (collection === 'deliveryInfo') {
			if (!data.address || !data.complement) {
				return false;
			}

			if ((!data.cep || !FieldValidator.isValidStringLength(data.cep)) || (!data.number || !FieldValidator.isValidStringLength(data.number)) || (!data.neighborhood || !FieldValidator.isValidStringLength(data.neighborhood)) || (!data.city || !FieldValidator.isValidStringLength(data.city))|| (!data.state || !FieldValidator.isValidStringLength(data.state))) {
				return false;
			}
		}

		if (collection === 'contactInfo') {
			const nameSpltied = data.name && data.name.split(' ');

			if (!data.name || nameSpltied.length === 1) {
				return false;
			}

			if (!data.cpf || !FieldValidator.isValidCpf(data.cpf)) {
				return false;
			}

			if (!data.email || !FieldValidator.isValidEmail(data.email)) {
				return false;
			}

			if (!data.cellphone || !FieldValidator.isValidPhoneNumber(data.cellphone)) {
				return false;
			}
		}

		return true;
	};

	const mountDeliveryAndContactInfo = data => {
		return {
			contactInfoMounted: {
				name: data.contact_info.name,
				order_id: data.order_id,
				cpf: data.contact_info.cpf,
				email: data.contact_info.email,
				cellphone: data.contact_info.cellphone,
			},
			deliveryInfoMounted: {
				address: data.delivery_info.address,
				cep: data.delivery_info.cep,
				order_id: data.order_id,
				number: data.delivery_info.number,
				complement: data.delivery_info.complement,
				neighborhood: data.delivery_info.neighborhood,
				city: data.delivery_info.city,
				state: data.delivery_info.state
			}
		};
	};

	const create = async (data, filter) => {
		const orderData = mountOrderInfo(data, filter);

		if (!isValid(orderData, 'orderInfo') || !data.products?.length) {
			return {
				error: true,
				message: 'Dados inválidos'
			};
		}

		const transaction = await Database.transaction();

		try {
			const orderCreated = await new OrderModel();

			orderCreated.fill(orderData);

			await orderCreated.save(transaction);

			const order = orderCreated.toJSON()

			data.order_id = order.id;
			data.user_id = filter.user_id || null;

			if (data.type === 'SALE') {
				const { contactInfoMounted, deliveryInfoMounted } = mountDeliveryAndContactInfo(data);

				if (!contactInfoMounted || !deliveryInfoMounted) {
					return {
						error: true,
						message: 'As informações da entrega e de contato são obrigatórias.'
					};
				}

				if (!isValid(contactInfoMounted, 'contactInfo') || !isValid(deliveryInfoMounted, 'deliveryInfo')) {
					return {
						error: true,
						message: 'Preencha as informações de contato e de entrega corretamente'
					};
				}

				const creditCardInfo = mountCreditCardInfo(data.creditcard_info);

				if (!isValid(creditCardInfo, 'cardInfo')) {
					return {
						error: true,
						message: 'Preencha as informações do cartão de crédito corretamente'
					}
				}

				const purchaseInfo = {
					kind: 'credit',
					reference: `ALRAC_${order.id}`,
					amount: ((orderData.price + orderData.delivery_price) * creditCardInfo.installments).toFixed(2).replace('.', ''),
					cardholderName: creditCardInfo.owner_name,
					cardNumber: creditCardInfo.number,
					expirationMonth: ~~creditCardInfo.validity.substr(0, 2),
					expirationYear: creditCardInfo.validity.substr(2, 2),
					securityCode: creditCardInfo.cvv,
					installments: creditCardInfo.installments,
					subscription: false
				};

				const redePayment = await addTransaction(purchaseInfo);

				if (!redePayment) {
					throw({
						message: 'Não foi possível processar o pagamento'
					});
				}

				const paymentInfo = {
					first_card_numbers: creditCardInfo.number.substr(0, 4),
					last_card_numbers: creditCardInfo.number.substr(-4),
					price: orderData.price + (orderData.delivery_price || 0),
					installments: creditCardInfo.installments,
					order_id: data.order_id
				};

				await Promise.all([
					OrderPaymentModel.create(paymentInfo, transaction),
					OrderDeliveryInfoModel.create(deliveryInfoMounted, transaction),
					OrderContactModel.create(contactInfoMounted, transaction),
				]);
			}

			const productsMounted = mountOrderProducts(data.products || [], {
				type: data.type,
				user_id: data.user_id,
				order_id: data.order_id
			});

			await OrderProductModel.createMany(productsMounted, transaction);

			if (data.type === 'SALE' && filter.user_id) {
				await OrderModel.query().where({
					user_id: filter.user_id,
					type: 'BAG',
					is_deleted: false
				}).update({ is_deleted: true });
			}

			await transaction.commit();

			return order;
		} catch (error) {
			await transaction.rollback();

			return {
				error: true,
				message: 'Algo de errado aconteceu'
			}
		}
	};

	const getNotificationSync = (filter, callback) => {
		request.get({
			url: `${eRedeEndpoint}/transactions/${filter.code}`,
			headers: {
				'Authorization': `Basic ${process.env.REDE_TOKEN}`,
				'Content-Type': 'application/json'
			}
		}, (error, httpResponse, body) => {
			if (httpResponse && (httpResponse.statusCode === 200) && body) {
				callback(null, JSON.parse(body));
				return;
			}

			callback('connection_failed');
		});
	};

	const paymentsCronJob = async () => {
		const queueGetNotification = async.queue((options, done) => {
			getNotificationSync(options.filter, done);
		}, 20);
		const queueUpdateOrderPayment = async.queue((options, done) => {
			OrderModel.query().where(options.filter).update(options.changes)
				.then((resp) => done(null, resp))
				.catch((error) => done(error, null));
		}, 5);

		const transactions = await OrderModel.query().where({
			type: 'SALE',
			is_deleted: false,
			status: 'WAITING'
		}).whereNotNull('code').select('id', 'code', 'status').all();

		const transactionsToUpdate = [];

		transactions.forEacH(item => {
			queueGetNotification.push({
				filter: {
					code: item.code
				}
			}, (err, resp) => {
				let parsedStatus;

				if (err || !resp || !Object.keys(resp).length || !resp.authorization) {
					return;
				}

				parsedStatus = getParsedStatus(resp.authorization.status);

				if (parsedStatus === 'IN_ANALYSIS') {
					return;
				}

				transactionsToUpdate.push({
					id: transaction.id,
					status: getParsedStatus(resp.authorization.status)
				});
			});
		})

		await new Promise(resolve => queueGetNotification.drain = () => resolve());

		transactionsToUpdate.forEach(item => {
			queueUpdateOrderPayment.push({
				changes: {
					status: transaction.status
				},
				filter: {
					id: transaction.id
				}
			});
		});

		return new Promise(resolve => queueUpdateOrderPayment.drain = () => resolve());
	}

	const getParsedStatus = status => {
		const parsedStatus = {
			'Approved': 'PAID',
			'Denied': 'DENIED',
			'Canceled': 'CANCELED',
			'Pending': 'IN_ANALYSIS'
		};

		return parsedStatus[status];
	};

	const addTransaction = data => {
		return new Promise(resolve => {
			const options = {
				url: `${eRedeEndpoint}/transactions`,
				headers: {
					'Authorization': `Basic ${process.env.REDE_TOKEN}`,
					'Content-Type': 'application/json'
				},
				json: data
			};

			request.post(options, (error, httpResponse, body) => {
				if (error) {
					return resolve();
				}

				if (httpResponse && (httpResponse.statusCode === 200) && body) {
					if (!~~body.returnCode) {
						return resolve(body);
					}

					return resolve();
				}

				if (body && Object.keys(body).length) {
					return resolve(body);
				}

				resolve();
			});
		});
	};

	const mountOrderProducts = (items, options) => {
		if (!items?.length) {
			return [];
		}

		return items.map(item => ({
			type: options.type,
			user_id: options.user_id || null,
			order_id: options.order_id,
			price: item.price,
			product_id: item.id || item.product_id,
			product_branch_id: item.product_branch_id,
			product_size_id: item.product_size_id || item.product_branch_size_id
		}));
	}

	const mountCreditCardInfo = data => {
		return {
			number: data.number,
			owner_name: data.owner_name,
			cvv: data.cvv,
			installments: data.installments || 1,
			validity: data.validity
		};
	};

	const updateBag = async (data, filter) => {
		const allowedActions = ['CLEAN', 'ADD_PRODUCT', 'REMOVE_PRODUCT'];
		const isValidAction = data.action && allowedActions.includes(data.action);

		if (!isValidAction)  {
			return {
				error: true,
				message: 'Dados inválidos'
			};
		}

		let order = await Order.query()
			.where('id', filter.id)
			.where('type', 'BAG')
			.where('is_deleted', false)
			.where('user_id', filter.user_id)
			.select('price')
			.first();

		if (!order) {
			return {
				error: true,
				message: 'Não foi possível encontrar a sacola.'
			};
		}

		order = order.toJSON();

		const transaction = await Database.transaction();

		try {
			if (data.action === 'ADD_PRODUCT') {
				const price = (order.price + (+data.product.price)) || 0;
				const productsToCreate = mountOrderProducts([data.product], {
					type: 'BAG',
					user_id: filter.user_id,
					order_id: filter.id
				});

				await OrderProductModel.createMany(productsToCreate, transaction);

				await OrderModel.query().where('id', filter.id)
					.update({ price: price });
			}

			let productPrice = 0;

			if (data.action === 'REMOVE_PRODUCT' && data.order_product_id) {
				const hasProducts = await OrderProduct.query()
					.where('order_id', filter.id)
					.where('id', data.order_product_id)
					.where('is_deleted', false)
					.first();

				if (!hasProducts) {
					throw({
						message: 'Este produto não está mais na sua sacola.'
					});
				}

				const product = await ProductModel.query()
					.where('id', data.product.id)
					.where('is_deleted', false)
					.select('price')
					.first();

				if (!product) {
					throw new Error();
				}

				productPrice = product.price;
			}

			if (data.action !== 'ADD_PRODUCT') {
				const price = (data.action === 'CLEAN' ? 0 : order.price - (+productPrice)) || 0;

				if (data.action === 'CLEAN') {
					const hasProducts = await OrderProduct.query()
						.where('order_id', filter.id)
						.where('is_deleted', false)
						.first();

					if (!hasProducts) {
							throw({
							message: 'A sacola já está vazia.'
						});
					}
				}

				const updateWhereCondition = {
					order_id: filter.id,
					is_deleted: false
				};

				if (data.action === 'REMOVE_PRODUCT') {
					updateWhereCondition.id = data.order_product_id;
				}

				await OrderProductModel.query()
					.where(updateWhereCondition)
					.update({ is_deleted: true });

				await OrderModel.query().where('id', filter.id)
					.update({ price: price });
			}

			await transaction.commit();

			return true
		} catch (error) {
			await transaction.rollback();

			return {
				error: true,
				message: error?.message || 'Não foi possível atualizar a sacola.'
			};
		}
	};

	return {
		create,
		updateBag,
		paymentsCronJob
	}
};
