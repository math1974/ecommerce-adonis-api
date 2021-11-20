'use strict'

const Route = use('Route')

const Middlewares = use('App/Middleware/Index')()

Route.group(() => {
	Route.post('/login', 'UserController.login');
	Route.post('/', 'UserController.create');
	Route.get('/', 'UserController.find').middleware(Middlewares.Auth);
}).prefix('/users');
