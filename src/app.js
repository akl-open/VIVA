

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { GoogleAssistant } = require('jovo-platform-googleassistant');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');
const { GoogleSheetsCMS } = require('jovo-cms-googlesheets');

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

	greetingIntent() {
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

	infoLyndaDotComIntent() {
		this.ask(this.t('info.lyndadotcom'), this.t('anythingelse.speech'));
	},

	infoMeetingRoomsIntent() {
		this.ask(this.t('info.meetingrooms'), this.t('anythingelse.speech'));
	},

	infoNewMemberIntent(){
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

	siteOpensIntent() {
	// we assume that they mean now rather than tomorrow or they would have said so
	// this should be redundant; if there is no date specified whenSiteOpenIntent() should be able to handle
	// either by checking for undef'd and sending a new date to openHoursHelper, or a default set in the skill/action

	// this.tell(this.$inputs.sitename.key + ' is open at blah');

		let speech = 'I\'m not sure ' + this.$inputs.sitename.key + ' exists';
		console.log('from sites open start ', speech);
		
		try {
			// find this site and get the open/close times from our spreadsheet - if not siteobj is undefined > error
			var siteobj = this.$cms.OPENCLOSE.find(o => o.site === this.$inputs.sitename.key);
			console.log('siteOpensIntent site requested: ' + this.$inputs.sitename.key + '----------------------');
			console.log('siteOpensIntent site found in googledoc: ', siteobj);

			var dayRequest = new Date();
			
			console.log('from sites open ', speech);
			speech = openHoursHelper(dayRequest, siteobj);
		}
		catch (e) {
			console.log ('siteOpenIntent', e);
			speech = 'Well, looks like I could not find that library, can you try again please?';
		}

		this.ask(this.t(speech), this.t('anythingelse.speech'));
	},


	/*
	if sitename.key missing "is the library open" <implies now>
		-> todo library picker - check if site is extended close, then mention that and suggest a near by site?
	for now we assume that the site is asked for, or is central library

	if whenDate.key undef'd "open time albany library" <implied now>
		-> giveTime(sitename, now())
	else
		set the session var to now() and do the case

	*/
	whenSiteOpenIntent() {
		let speech = 'Hmm, ' + this.$inputs.sitename.key + ' doesn\'t ring a bell';

		try {
			// find this site and get the open/close times from our spreadsheet - if not siteobj is undefined > error

			console.log('whenSiteOpenIntent site requested: ' + this.$inputs.sitename.key + ' ----------------------');


			var siteobj = this.$cms.OPENCLOSE.find(o => o.site === this.$inputs.sitename.key);
			var dayRequest = parseISOString(this.$inputs.whenDate.key);

			speech = openHoursHelper(dayRequest, siteobj);
		}
		// reprompt
		catch (e) {
			console.log('whenSiteOpenIntent had something go wrong \n', e, '--------------------------------------------');
		}

		this.ask(this.t(speech), this.t('anythingelse.speech'));
	},

	nearestLibraryIntent(){
		let speech = "Sure, what suburb are you in?";


		this.followUpState('locationState')
			.ask(speech, this.t('anythingelse.speech'));

	},

	locationState: {

		suburbIntent() {

			 try{
					var libraryList = this.$cms.suburbSearch;
					var library = getNearestLibrary( libraryList, this.$inputs.sitename.key);
					
					console.log("suburb intent: "+ library + " input: "+ this.$inputs.sitename.key);
					
					if(library != ""){
					
						let speech = "Your nearest library is " + library;
						this.ask(speech, this.t('anythingelse.speech'));
					}
					else{
							this.ask("Sorry we I cant find a nearby library is there anything else I can help you with?");
					}
					
				}
			 catch (e) {
				
				console.log('suburb intent had something go wrong \n', e, '--------------------------------------------')
			}
	
		},
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
	parseISOString
		takes ISO Date formatted string yyyy-MM-ddThh:mm:ssZ or yyyy-MM-dd
		converts to a json date object
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
	openHoursHelper
		Gives the open hours for each day of the week.
		If is a site is on extended closure then it will provide the dates instead.
	@param siteHours is a JSON array, one site open close times lifted from googledoc
	@param day is a Date, the day the hours are requested for
	@return speech, string containing some formatted speech
*/
function openHoursHelper(dayRequest, siteobj) {

	var returnSpeech = 'openHoursHelper speech not assigned';

	console.log('openHoursHelper ', siteobj, dayRequest);
	if (siteobj !== undefined) {
		//check site isn't on 'extended close'
		if (siteobj.extendedclose === '') {

			// set speech based on day of week, closed all day or open hours
			switch (dayRequest.getDay()) {
			  case 0:
				if (siteobj.sundayopen.match(/[Cc]lose/)) {
					returnSpeech = siteobj.site + ' is closed all day Sunday.';
				}
				else {
					returnSpeech = "On Sunday " + siteobj.site + " opens at " + siteobj.sundayopen + " and closes at " + siteobj.sundayclose;
				}
				break;
			  case 1:
				if (siteobj.mondayopen.match(/[Cc]lose/)) {
					returnSpeech = siteobj.site + ' is closed all day Monday.';
				}
				else {
					returnSpeech = "On Monday " + siteobj.site + " opens at " + siteobj.mondayopen + " and closes at " + siteobj.mondayclose;
				}
				break;
			  case 2:
				if (siteobj.tuesdayopen.match(/[Cc]lose/)) {
					returnSpeech = siteobj.site + ' is closed all day Tuesday.';
				}
				else {
					returnSpeech = "On Tuesday " + siteobj.site + " opens at " + siteobj.tuesdayopen + " and closes at " + siteobj.tuesdayclose;
				}
				break;
			  case 3:
				if (siteobj.wednesdayopen.match(/[Cc]lose/)) {
					returnSpeech = siteobj.site + ' is closed all day Wednesday.';
				}
				else {
					returnSpeech = "On Wednesday " + siteobj.site + " opens at " + siteobj.wednesdayopen + " and closes at " + siteobj.wednesdayclose;
				}
				break;
			  case 4:
				if (siteobj.thursdayopen.match(/[Cc]lose/)) {
					returnSpeech = siteobj.site + ' is closed all day Thursday.';
				}
				else {
					returnSpeech = "On Thursday " + siteobj.site + " opens at " + siteobj.thursdayopen + " and closes at " + siteobj.thursdayclose;
				}
				break;
			  case 5:
				if (siteobj.fridayopen.match(/[Cc]lose/)) {
					returnSpeech = siteobj.site + ' is closed all day Friday.';
				}
				else {
					returnSpeech = "On Friday " + siteobj.site + " opens at " + siteobj.fridayopen + " and closes at " + siteobj.fridayclose;
				}
				break;
			  case 6:
				if (siteobj.saturdayopen.match(/[Cc]lose/)) {
					returnSpeech = siteobj.site + ' is closed all day Saturday.';
				}
				else {
					returnSpeech = "On Saturday " + siteobj.site + " opens at " + siteobj.saturdayopen + " and closes at " + siteobj.saturdayclose;
				}
			}
		}

		// site is extended closed
		// to do add a site picker option to find nearby to the site
		// to do add a reason column
		else {
			returnSpeech = siteobj.site + " is closed from " + siteobj.extendedclose + " and opens again on " + siteobj.extendedopen + " due to " + siteobj.extendedreason;
		}
	}
	else {
		returnSpeech = "I'm not sure that site exists, can you try again please";
		console.log("openHoursHelper site is undefined ", siteobj);
	}
	// Seems something in the backend doesn't automatically escape out colons... or something.
	//returnSpeech.replace(/:/g, ".");
	//doesn't appear to be doing anything, would be good to make work

	//console.log("helper is trying to return returnSpeech ", returnSpeech.toString() + '------------------------');
	return returnSpeech;
}

//used to get the list of nearest libraries from a key value pair object
//@param obj: An object of jey value pairs that is a copy of the Google sheet
//@param input: The suburb name as the keyword input by the user 
function getNearestLibrary(obj, input) {
  var result = "";
	for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
			if(key == input){
				result = obj[key];
			}				
    }
	}
  return result;
}

module.exports.app = app;
