

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { GoogleAssistant } = require('jovo-platform-googleassistant');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');
const { GoogleSheetsCMS } = require('jovo-cms-googlesheets');
const requestPromise = require('request-promise-native');
const APIKey = "Lzg1TDZodGF2QVBmbXRPU3o5MnFCK21ySWpoVTprTzM3ME8xUjVoQUs2ZlA="
var token;

const app = new App();

app.use(
	new Alexa(),
	new GoogleAssistant(),
	new JovoDebugger(),
	new FileDb(),
	new GoogleSheetsCMS()
);


// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({
	LAUNCH() {
		return this.toIntent('greetingIntent');
	},

	eventsAtLibraryIntent() {
		var input = this.$inputs.sitename.key;
		console.log("eventsAtLibraryIntent:" + input);
		if (input != undefined && input != "") {
			var wAndRObj = this.$cms.wiggleAndRhyme.find(o => o.id == input);
			var rTimeObj = this.$cms.rhymeTime.find(o => o.id == input);
			var sTimeObj = this.$cms.storyTime.find(o => o.id == input);

			var lib = libraryEventsList(wAndRObj, rTimeObj, sTimeObj);
			this.ask(lib, this.t('anythingelse.speech'));
		}
		else {
			this.toIntent('infoWhenOpenNoSite');
		}
	},

	async greetingIntent() {
		//authenticate with Sierra and get a promise of a token
		var code = connectToSierra();

		//get the token from he promise and assign it to the token variable
		code.then(function (value) {
			token = value;
			console.log("greetingIntent tokenkey" + token);
		});

		//Welcome speech
		this.ask(this.t('greeting.speech'), this.t('anythingelse.speech'));
	},

	infoAccountDetailsIntent() {
		this.ask(this.t('info.accountdetails'), this.t('anythingelse.speech'));
	},

	infoBookReturnsIntent() {
		this.ask(this.t('info.returns'), this.t('anythingelse.speech'));
	},

	infoCabHoursIntent() {
		this.ask(this.t('info.cabhours'), this.t('anythingelse.speech'));
	},

	infoCardLostIntent() {
		this.ask(this.t('info.lostcard'), this.t('anythingelse.speech'));
	},

	infoCardOldIntent() {
		this.ask(this.t('info.oldlibrarycard'), this.t('anythingelse.speech'));
	},

	infoEventDescriptionIntent() {
		console.log("infoEventDescriptionIntent ************ " + this.$inputs.eventName.key);
		var input = this.$inputs.eventName.key;

		switch (input) {
			case "1":
				this.ask(this.t('info.eventRhymeTime'), this.t('anythingelse.speech'));
				break;
			case "2":
				this.ask(this.t('info.eventStoryTime'), this.t('anythingelse.speech'));
				break;
			case "3":
				this.ask(this.t('info.eventWriggleAndRhyme'), this.t('anythingelse.speech'));
				break;
			default:
				this.ask("Sorry I cant help with that event yet, is there anything else I can help you with")
		}

	},

	infoKidsEvents() {
		this.ask(this.t('info.kidsEvents'), this.t('anythingelse.speech'));
	},

	infoKidsEventBooking() {
		this.ask(this.t('info.kidsEventBooking'), this.t('anythingelse.speech'));
	},

	infoFreeWiFi() {
		this.ask(this.t('info.freewifi'), this.t('anythingelse.speech'));
	},

	infoFreeComputers() {
		this.ask(this.t('info.freecomputers'), this.t('anythingelse.speech'));
	},

	infoItemBorrowLimitIntent() {
		this.ask(this.t('info.itemborrowlimit'), this.t('anythingelse.speech'));
	},

	infoJusticeIntent() {
		this.ask(this.t('info.justicepeace'), this.t('anythingelse.speech'));
	},

	infoJokeIntent(){
		//this is an easter egg
		var jokeList = ["Have you seen the Bruce Willis movie where an entire library gets destroyed? It's called \"Die Hardcover\" ", 
						"What did the Librarian say to the rapper? \"I like big books and I can not lie\" ", 
						"What do you do if your pet starts eating your library book? You take the words right out of their mouth."
					];
		let response =  jokeList[Math.floor(Math.random()*3)];
		console.log(response);
		
		this.ask(response, this.t('anythingelse.speech'));
	},

	infoLyndaDotComIntent() {
		this.ask(this.t('info.lyndadotcom'), this.t('anythingelse.speech'));
	},

	infoMeetingRoomsIntent() {
		this.ask(this.t('info.meetingrooms'), this.t('anythingelse.speech'));
	},

	infoNewMemberIntent() {
		this.ask(this.t('info.newmember'), this.t('anythingelse.speech'));
	},

	infoPrintingIntent() {
		this.ask(this.t('info.printing'), this.t('anythingelse.speech'));
	},

	infoPrintingCostIntent() {
		this.ask(this.t('info.printingcost'), this.t('anythingelse.speech'));
	},

	infoPrintThreeDIntent() {
		this.ask(this.t('info.3dprint'), this.t('anythingelse.speech'));
	},

	infoUpdateDetails() {
		this.ask(this.t('info.updatedetails'), this.t('anythingelse.speech'));
	},

	infoWhenOpenNoSite() {
		this.ask(this.t('Please ask again with a library name eg Botany Library'), this.t('anythingelse.speech'));
	},

	siteOpensIntent() {
		// we assume that they mean now rather than tomorrow or they would have said so
		// this should be redundant; if there is no date specified whenSiteOpenIntent() should be able to handle
		// either by checking for undef'd and sending a new date to openHoursHelper, or a default set in the skill/action

		let speech = 'I\'m not sure ' + this.$inputs.sitename.key + ' exists';
		console.log('from sites open start ', speech, this.$data);

		try {
			// find this site and get the open/close times from our spreadsheet - if not siteobj is undefined > error
			var siteobj = this.$cms.OPENCLOSE.find(o => o.id === this.$inputs.sitename.key);
			console.log('siteOpensIntent site requested: ' + this.$inputs.sitename.key + '----------------------');
			console.log('siteOpensIntent site found in googledoc: ', siteobj);

			var dayRequest = new Date();

			console.log('from sites open ', speech);
			speech = openHoursHelper(dayRequest, siteobj);
		}
		catch (e) {
			console.log('siteOpenIntent', e);
			speech = 'Well, looks like I could not find that library, can you try again please?';
		}

		this.ask(this.t(speech), this.t('anythingelse.speech'));
	},

	async bookAvaliabilityIntent() {
		var input = this.$inputs.bookTitle.value;
		var output;

		output = await getitemsByTitle(token, input);
		console.log(JSON.stringify(output));

		this.$session.$data.listofbooks = output;

		//loop counter for listingState
		this.$session.$data.loopCounter = 0;

		//send to listingState
		this.followUpState('listingState')
			.toIntent('listingTitlesIntent');
	},

	listingState: {

		listingTitlesIntent() {
			// present the next title in the list from this.$session.$data.listofbooks
			// loops based on this.$session.$data.loopCounter

			let speech = '';
			let showing = this.$session.$data.loopCounter;

			// present current item
			if (showing < this.$session.$data.listofbooks.length) {
				let title = this.$session.$data.listofbooks[this.$session.$data.loopCounter];
				this.ask(this.t('Is the one you want ' + title.title + ' by ' + title.author), this.t('anythingelse.speech'));
			}
			// none of the titles listed are picked, suggest we buy it
			else {
				this.removeState();
				this.toIntent('bookPurchaseIntent');
			}
		},

		confirmIntent() {
			// if a book is picked set as the session array this.$session.$data.listofbooks
			let choice = this.$inputs.pick.value;
			let counter = this.$session.$data.loopCounter;
			let title = this.$session.$data.listofbooks[counter];

			console.log('confirmIntent ' + choice + ' ' + counter + ' which is ' + title + '------------------------');

			if (choice !== undefined && choice != '') {
				switch (choice) {
					case 'yes':
						this.$session.$data.listofbooks = this.$session.$data.listofbooks[counter];
						this.$session.$data.loopCounter = 0;
						this.removeState();
						this.toIntent('bookRequestIntent');
						break;
					case 'no':
						this.$session.$data.loopCounter = parseInt(counter) + 1;
						this.toIntent('listingTitlesIntent');
						break;
					case 'cancel':
						this.removeState();
						this.$session.$data.loopCounter = 0;
						this.$session.$data.listofbooks = '';
						this.ask(this.t('Ok no worries, I will forget all about it.'), this.t('anythingelse.speech'));
						break;
					default:
						this.toIntent('Unhandled');
				}
			}
		},
	},


	bookPurchaseIntent() {
		// customer is suggesting the library to buy a book
		console.log('bookPurchaseIntent was called ' + JSON.stringify(this.$inputs.bookTitle) + ' ------------------');
		this.ask(this.t('info.suggestPurchase'), this.t('anythingelse.speech'));
	},

	bookRequestIntent() {
		// customer wants info on how to request a specific title
		this.ask(this.t('info.requestItem'), this.t('anythingelse.speech'));
	},

	whenSiteOpenIntent() {
		// customer wants to know when a site is open. No time stated means they want to know about 'now'
		let speech = 'Hmm, that doesn\'t ring a bell';

		try {
			// find this site and get the open/close times from our spreadsheet - if not siteobj is undefined > error

			console.log('whenSiteOpenIntent site requested: ', this.$inputs, ' ----------------------');


			var siteobj = this.$cms.OPENCLOSE.find(o => o.id === this.$inputs.sitename.key);
			var dayRequest = parseISOString(this.$inputs.whenDate.key);

			speech = openHoursHelper(dayRequest, siteobj);
		}
		// reprompt
		catch (e) {
			console.log('whenSiteOpenIntent had something go wrong \n', e, '--------------------------------------------');
		}

		this.ask(this.t(speech), this.t('anythingelse.speech'));
	},

	nearestLibraryIntent() {
		let speech = "Sure, what suburb are you in?";

		this.followUpState('locationState')
			.ask(speech, this.t('anythingelse.speech'));

	},

	locationState: {

		suburbIntent() {

			try {
				var libraryList = this.$cms.suburbSearch;
				var library = getNearestLibrary(libraryList, this.$inputs.suburbName.key);

				console.log("suburb intent: " + library + " input: " + this.$inputs.suburbName.key);

				if (library != "") {

					let speech = "Your nearest library is " + library;
					this.ask(this.t(speech), this.t('anythingelse.speech'));
				}
				else {
					this.ask("Sorry I cant find a nearby library is there anything else I can help you with?");
				}

			}
			catch (e) {

				console.log('suburb intent had something go wrong \n', e, '--------------------------------------------')
			}

		},
	},

	eventBySiteAtTimeIntent() {
		// user has asked for a specific event at a specific library at a time	

		var dayRequest = this.$inputs.whenDate.key;
		var sitename = this.$inputs.sitename.key;
		var eventsname = this.$inputs.eventname.key;
		var eventsobj;

		// no date requested, assume today
		if (dayRequest !== undefined && dayRequest !== '') {
			dayRequest = parseISOString(dayRequest);
		}
		else {
			dayRequest = new Date();
		}

		if (eventsname !== undefined && eventsname !== "") {
			try {
				if (sitename !== undefined && sitename !== "") {
					switch (eventsname) {
						case '1':
							eventsname = 'Rhyme Time';
							eventsobj = this.$cms.rhymeTime.find(o => o.id === sitename);
							break;
						case '2':
							eventsname = 'Story Time';
							eventsobj = this.$cms.storyTime.find(o => o.id === sitename);
							break;
						case '3':
							eventsname = 'Wriggle and Rhyme';
							eventsobj = this.$cms.wiggleAndRhyme.find(o => o.id === sitename);
							break;
					}

					let speech = openHoursHelper(dayRequest, eventsobj, eventsname);
					this.ask(this.t(speech), this.t('anythingelse.speech'));
				}

				// no site requested, ask for a site
				else
					this.toIntent('infoWhenOpenNoSite');
			}
			catch (e) {
				console.log('eventBySiteAtTimeIntent went wrong\n', e, '--------------------------------');
			}
		}
		// no event requested, ask to specify
		else {
			console.log('eventBySiteAtTimeIntent no event requested ----------------');
			this.ask(this.t('I do need to know the event name to look up the times'), this.t('anythingelse.speech'));
		}
	},


	// default intents start here
	cancelIntent() {
		console.log('cancelIntent invoked');
		let cancelSpeech = 'ok, cancelling that';
		this.ask(this.t(cancelSpeech));
	},

	defaultHelpIntent() {
		console.log('helpIntent invoked');
		this.ask(this.t('info.help'), this.t('anythingelse.speech'));
	},

	END() {
		console.log('endInvoked');
		let speech = 'Ok, talk to you later.';
		this.tell(this.t(speech));
	},

	fallBackIntent() {
		console.log('fallBackIntent invoked');
		let speech = 'Hmm, could you maybe try whatever you said slower or something';
		this.ask(this.t(speech));
	},

	stopIntent() {
		console.log('stopIntent invoked');
		return this.toIntent('END');
	},

	Unhandled() {
		console.log('globaly unhandled intent invoked');
		this.ask(this.t('Oh dear, can you try saying that a little differently'));
	},

});

/*
	parseISOString:	Takes ISO Date formatted string yyyy-MM-ddThh:mm:ssZ or yyyy-MM-dd converts to a json date object
	@param s is an ISO formatted date string
	@return new date set to the content of the string
*/
function parseISOString(s) {
	var b = s.split(/\D+/);
	console.log('parseISOString from to ', s, b);

	if (b.length = 3)
		return new Date(Date.UTC(b[0], --b[1], b[2]));
	else
		return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}

/*
	openHoursHelper: Gives the open hours for each day of the week.	If is a site is on extended closure then it will provide the dates instead.
	@param eventInfo string name of event requested (optional)
	@param siteobj is a JSON array, one row of site open times or event times lifted from googledoc
	@param day is a Date, the day the hours are requested for
	@return speech, string containing some formatted speech
*/
function openHoursHelper(dayRequest, siteobj, eventInfo) {

	var returnSpeech = '';

	console.log('openHoursHelper ', dayRequest, siteobj, eventInfo);

	if (siteobj !== undefined) {
		//check site isn't on 'extended close'
		if (siteobj.extendedclose === undefined || siteobj.extendedclose === '') {

			// set speech based on day of week, closed all day or open hours
			switch (dayRequest.getDay()) {
				case 0:
					if (eventInfo !== undefined && siteobj.sunday !== '') {
						returnSpeech = siteobj.sunday;
					}
					else if (eventInfo !== undefined && siteobj.sunday === '') {
						returnSpeech = eventInfo + ' isn\'t on at ' + siteobj.site + ' on a Sunday.';
					}
					else
						if (eventInfo === undefined && siteobj.sundayopen.match(/[Cc]lose/)) {
							returnSpeech = siteobj.site + ' is closed all day Sunday.';
						}
						else {
							returnSpeech = "On Sunday " + siteobj.site + " opens at " + siteobj.sundayopen + " and closes at " + siteobj.sundayclose;
						}
					break;
				case 1:
					if (eventInfo !== undefined && siteobj.monday !== '') {
						returnSpeech = siteobj.monday;
					}
					else if (eventInfo !== undefined && siteobj.monday === '') {
						returnSpeech = eventInfo + ' isn\'t on at ' + siteobj.site + ' on a Monday.';
					}
					else if (eventInfo === undefined && siteobj.mondayopen.match(/[Cc]lose/)) {
						returnSpeech = siteobj.site + ' is closed all day Monday.';
					}
					else {
						returnSpeech = "On Monday " + siteobj.site + " opens at " + siteobj.mondayopen + " and closes at " + siteobj.mondayclose;
					}
					break;
				case 2:
					if (eventInfo !== undefined && siteobj.tuesday !== '') {
						returnSpeech = siteobj.monday;
					}
					else if (eventInfo !== undefined && siteobj.tuesday === '') {
						returnSpeech = eventInfo + ' isn\'t on at ' + siteobj.site + ' on a Tuesday.';
					}
					else if (eventInfo === undefined && siteobj.tuesdayopen.match(/[Cc]lose/)) {
						returnSpeech = siteobj.site + ' is closed all day Tuesday.';
					}
					else {
						returnSpeech = "On Tuesday " + siteobj.site + " opens at " + siteobj.tuesdayopen + " and closes at " + siteobj.tuesdayclose;
					}
					break;
				case 3:
					if (eventInfo !== undefined && siteobj.wednesday !== '') {
						returnSpeech = siteobj.monday;
					}
					else if (eventInfo !== undefined && siteobj.wednesday === '') {
						returnSpeech = eventInfo + ' isn\'t on at ' + siteobj.site + ' on a Wednesday.';
					}
					else if (eventInfo === undefined && siteobj.wednesdayopen.match(/[Cc]lose/)) {
						returnSpeech = siteobj.site + ' is closed all day Wednesday.';
					}
					else {
						returnSpeech = "On Wednesday " + siteobj.site + " opens at " + siteobj.wednesdayopen + " and closes at " + siteobj.wednesdayclose;
					}
					break;
				case 4:
					if (eventInfo !== undefined && siteobj.thursday !== '') {
						returnSpeech = siteobj.thursday;
					}
					else if (eventInfo !== undefined && siteobj.thursday === '') {
						returnSpeech = eventInfo + ' isn\'t on at ' + siteobj.site + ' on a Thursday.';
					}
					else if (eventInfo === undefined && siteobj.thursdayopen.match(/[Cc]lose/)) {
						returnSpeech = siteobj.site + ' is closed all day Thursday.';
					}
					else {
						returnSpeech = "On Thursday " + siteobj.site + " opens at " + siteobj.thursdayopen + " and closes at " + siteobj.thursdayclose;
					}
					break;
				case 5:
					if (eventInfo !== undefined && siteobj.friday !== '') {
						returnSpeech = siteobj.friday;
					}
					else if (eventInfo !== undefined && siteobj.friday === '') {
						returnSpeech = eventInfo + ' isn\'t on at ' + siteobj.site + ' on a Friday.';
					}
					else if (eventInfo === undefined && siteobj.fridayopen.match(/[Cc]lose/)) {
						returnSpeech = siteobj.site + ' is closed all day Friday.';
					}
					else {
						returnSpeech = "On Friday " + siteobj.site + " opens at " + siteobj.fridayopen + " and closes at " + siteobj.fridayclose;
					}
					break;
				case 6:
					if (eventInfo !== undefined && siteobj.saturday !== '') {
						returnSpeech = siteobj.friday;
					}
					else if (eventInfo !== undefined && siteobj.saturday === '') {
						returnSpeech = eventInfo + ' isn\'t on at ' + siteobj.site + ' on a Saturday.';
					}
					else if (eventInfo === undefined && siteobj.saturdayopen.match(/[Cc]lose/)) {
						returnSpeech = siteobj.site + ' is closed all day Saturday.';
					}
					else {
						returnSpeech = "On Saturday " + siteobj.site + " opens at " + siteobj.saturdayopen + " and closes at " + siteobj.saturdayclose;
					}
			}
		}
		else {
			returnSpeech = siteobj.site + " is closed from " + siteobj.extendedclose + " and opens again on " + siteobj.extendedopen + " due to " + siteobj.extendedreason;
		}
	}
	else {
		returnSpeech = "I'm not sure that site exists, can you try again please";
		console.log("openHoursHelper site is undefined ", siteobj);
	}

	let speech = returnSpeech.toString().replace(/:/g, "-");
	console.log("helper is trying to return returnSpeech ", speech);
	return speech;
}

//used to get the list of nearest libraries from a key value pair object
//@param obj: An object of jey value pairs that is a copy of the Google sheet
//@param input: The suburb name as the keyword input by the user 
function getNearestLibrary(obj, input) {
	var result = "";
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			if (key.toLowerCase() == input.toLowerCase()) {
				result = obj[key];
			}
		}
	}
	console.log("getNearestLibraryResult: " + result);
	return result;
}

//used to get a list of events at the requested library
//@param wAndR: An object of of the selected row from the wriggleAndRhyme google sheet
//@param rTime: An object of of the selected row from the rhymetime google sheet
//@param sTime: An object of of the selected row from the storytime google sheet
//@return returns a list of event happening at the library.
function libraryEventsList(wAndR, rTime, sTime) {
	var wriggleAndRhyme = "";
	var rhymeTime = "";
	var storyTime = "";
	var result = "";

	console.log("libraryEventsList:WandR: " + JSON.stringify(wAndR));
	console.log("libraryEventsList:RTime: " + JSON.stringify(rTime));
	console.log("libraryEventsList:STime: " + JSON.stringify(sTime));

	//Create event list for wriggle and Rhyme
	for (var val in wAndR) {
		if (wAndR[val] != '' && val != 'id' && val != 'site') {

			wriggleAndRhyme = wriggleAndRhyme + " " + wAndR[val] + ",";
		}
	}
	//Create event list for Rhymetime
	for (var val in rTime) {
		if (rTime[val] != '' && val != 'id' && val != 'site') {

			rhymeTime = rhymeTime + " " + rTime[val] + ",";
		}
	}
	//Create event list for Storytime
	for (var val in sTime) {
		if (sTime[val] != '' && val != 'id' && val != 'site') {

			storyTime = storyTime + " " + sTime[val] + ",";
		}
	}

	if (rhymeTime != '') {
		result = result + " Rhyme time is on " + rhymeTime;
	}
	if (storyTime != '') {
		result = result + "  Story time is on " + storyTime;
	}
	if (wriggleAndRhyme != '') {
		result = result + " Wriggle and Rhyme is on " + wriggleAndRhyme;
	}

	console.log("libraryEventsList: Final Result :" + result);
	return result;
}

//used to Authenticate ourselves witht he Sierra servers
//@return: returns a token that is valid for 3600 minutes
async function connectToSierra() {
	const options = {
		method: 'POST',
		uri: 'https://test.elgar.govt.nz:443/iii/sierra-api/v5/token',
		headers: {
			'Authorization': 'Basic ' + APIKey
		},
		body: {
			'grant_type': 'client_credentials'
		},
		json: true // Automatically parses the JSON string in the response,
	};

	const data = await requestPromise(options);

	const token = data.access_token;

	return token;
}

//used to get a list of events at the requested library
//@param token: The token that was received form the authentication API
//@param input: the search keywords that are received from the user
//@return: a list of items after it is cleaned in order to be presented to the user
async function getitemsByTitle(token, input) {
	let url = encodeURI("https://test.elgar.govt.nz/iii/sierra-api/v5/bibs/search?limit=50&offset=0&fields=title,author,lang,materialType,deleted,suppressed&text=" + input);
	console.log("getitemsByTitle" + url);

	const options = {
		method: 'GET',
		uri: url,
		headers: {
			'Authorization': 'Bearer ' + token,
			'Content-Type': 'application/json;charset=UTF-8'
		},
		json: true // Automatically parses the JSON string in the response,
	};

	const promData = await requestPromise(options);
	let data = promData;

	let result = cleanSearchResponse(data);

	return result;

}
//Format the getItems response from sierrra
//@param data: an array of objects from the sierra response
//@return: a list of items after it is cleaned in order to be presented to the user
function cleanSearchResponse(data) {

	let rawList = data.entries;

	let cleanList = [];

	for (i = 0; i < rawList.length; i++) {
		//Exclude items with a relevance of less than 1.0
		if (parseFloat(rawList[i].relevance) < 1.0) { continue; }
		//Exclude items that are suppressed
		if (rawList[i].bib.suppressed == true) { continue; }
		//Exclude items that are deleted
		if (rawList[i].bib.deleted == true) { continue; }
		//Exclude items that are not books
		if (rawList[i].bib.materialType.code != "a  ") { continue; }
		//Exclude items that are not in english
		if (rawList[i].bib.lang.code != "eng") { continue; }

		let title = rawList[i].bib.title.toString().replace(/:/g, "-");
		let returnItem = { id: rawList[i].bib.id, title: title, author: rawList[i].bib.author };

		cleanList.push(returnItem);

	}

	return cleanList;
}

module.exports.app = app;
