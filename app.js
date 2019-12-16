const express = require('express')
const bodyParser = require('body-parser')
const graphQlHttp = require('express-graphql')
const mongoose = require('mongoose');
const isAuth = require('./middleware/is-auth');

const graphQlSchema = require('./graphql/schema/index')
const graphQlResolvers = require('./graphql/resolvers/index')

const app = express();

app.use(bodyParser.json());


// app.use((req, res, next)=> {
// 	res.setHeader('Access-Control-Allow-Origin', '*');
// 	res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
// 	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
// 	if (req.method === 'OPTIONS') {
// 		return res.sendStatus(200);
// 	}
// 	next();
// });

app.use(isAuth);

app.use('/graphql', graphQlHttp({
	schema: graphQlSchema,
	rootValue: graphQlResolvers,
	graphiql: true
}))

mongoose.connect(`mongodb+srv://${process.env.MONGO_user}:${process.env.MONGO_password}@cluster0-il454.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`, 
	{ useNewUrlParser: true }).then( () => {
		const PORT = process.env.PORT || 8000
		app.listen(PORT, () => { console.log(`Mixing it up on port ${PORT} with MONGO`) })
	} ).catch(err => {
		console.log(err)
	})

