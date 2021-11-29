'use strict'

const Route = use('Route')

const Middlewares = use('App/Middleware/Index')()

Route.group(() => {
	Route.post('/', 'UserController.create');
	Route.get('/', 'UserController.find').middleware(Middlewares.Auth);
}).prefix('/users');

Route.group(() => {
	Route.post('/login', 'UserController.login');
}).prefix('/auth');

Route.group(() => {
	Route.post('/', 'OrderController.create').middleware(Middlewares.Auth)
	Route.put('/bag/:id', 'OrderController.updateBag').middleware(Middlewares.Auth)
}).prefix('/order')

