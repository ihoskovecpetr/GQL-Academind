const Event = require('../../Models/event');
const User = require('../../Models/user');
const { dateToString } = require('../../helpers/date')
//const { userLookup } = require('./merge')



const transformEvent = event => {
	console.log("transformEvent FCE: ", event)
	return { 	...event._doc,
				_id: event._doc._id,
				date: dateToString(event._doc.date),
				creator: userLookup.bind(this, event._doc.creator) 
			}
}

const userLookup = async userId => {
	try{

		const userLookupResult = await User.findById(userId)

		console.log("userLookup result: ", userLookupResult)
		console.log("userLookup result._doc: ", userLookupResult._doc)
			return { 	...userLookupResult._doc,
						password: null,
						createdEvents: eventsLookup.bind(this, userLookupResult._doc.createdEvents)}
		} catch(err){
			throw err
		}
}

const eventsLookup = async eventIds => {
try {

	console.log("eventsLookup ARRAY: ", eventIds)
	const events = await Event.find({ _id: { $in: eventIds}})
	console.log("eventsLookup result: ", events)

	return events.map(event => {
		console.log("SS: ", event)
		return transformEvent(event)
	 })
	} catch(err) {
	  throw err
	}
}



module.exports = {
		events: async () => {
			try{
				const events = await Event.find()
				console.log("query events: ", events)
				return events.map(event => {
					return transformEvent(event)
				})
			}
			catch(err) {
				throw err
			}
		},
		createEvent: async (args, req) => {

			console.log("createEvent RESOLVERRR")

			if (!req.isAuth) {
				throw new Error('Unauthenticated');
			}

			const event = new Event({
				title: args.eventInput.title,
				description: args.eventInput.description,
				price: +args.eventInput.price,
				date: new Date(args.eventInput.date),
				creator: req.userId
			});
			let justCreatedEvent;
			try {
			const result = await event.save()
			
			console.log("Event created form:")
			console.log(result)
				
				justCreatedEvent = result;

				const user = await User.findById(req.userId)
				
				if (!user) {
					throw new Error("User does not exists")
				}
				
				user.createdEvents.push(event)
				await user.save();
				console.log("returning Just created Event now") 
				return justCreatedEvent;
			
			} catch(err) {
				console.log(err)
			}
			// return event;
		}

	}