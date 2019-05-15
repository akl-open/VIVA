'use strict';

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

	infoBookReturnsIntent() {
		this.ask(this.t('info.returns'), this.t('anythingelse.speech'));
	},

	infoLostCardIntent() {
		this.ask(this.t('info.lostcard'), this.t('anythingelse.speech'));
	},

	infoJusticeIntent() {
		this.ask(this.t('info.justicepeace'), this.t('anythingelse.speech'));
	},

	infoCabHoursIntent() {
		this.ask(this.t('info.cabhours'), this.t('anythingelse.speech'));
	},

	infoPrintingIntent() {
		this.ask(this.t('info.printing'), this.t('anythingelse.speech'));
	},

	infoItemBorrowLimitIntent() {
		this.ask(this.t('info.itemborrowlimit'), this.t('anythingelse.speech'));
	},

	infoThreeDPrintIntent() {
		this.ask(this.t('info.3dprint'), this.t('anythingelse.speech'));
	},

	infoLyndaDotComIntent() {
		this.ask(this.t('info.lyndadotcom'), this.t('anythingelse.speech'));
	},

	siteOpensIntent() {
	// yes, this is horrible code style
// we assume that they mean now rather than tomorrow or they would have said so
//		this.$session.$data.aboutWhen = new Date();
//console.log('siteOpenIntent ' + this.$session.$data.aboutWhen + ' -------------------------');
//		return this.toIntent('whenSiteOpenIntent');

//		this.tell(this.$inputs.sitename.key + ' is open at blah');

		let speech = 'I\'m not sure ' + this.$inputs.sitename.key + ' exists';

		try {
			// find this site and get the open/close times from our spreadsheet - if not siteobj is undefined > error
			var siteobj = this.$cms.OPENCLOSE.find(o => o.site === this.$inputs.sitename.key);
//console.log("siteOpensIntent " + siteobj.site ' ---------------------------');
			var dayRequest = new Date();

			// extendedclose is either blank (open) or the date it closed
			// logic needs to be extended to be a bit more forgiving (make relative to today)
//console.log('trying openHoursHelper---------------', siteobj, dayRequest);
// 			speech = openHoursHelper(this.siteobj, this.dayRequest);
//console.log('speech from function is ' + speech + '-----------------------');

			if (siteobj.extendedclose === '') {

				// alexa (at least) will return a date for now/tomorrow/next friday etc using system default slots.

				switch (dayRequest.getDay()) { //new Date(this.$inputs.whenDate.key).getDay()) {
				  case 0:
				    speech = "On Sunday " + siteobj.site + " opens at " + siteobj.sundayopen + " and closes at " + siteobj.sundayclose;
				    break;
				  case 1:
				    speech = "On Monday " + siteobj.site + " opens at " + siteobj.mondayopen + " and closes at " + siteobj.mondayclose;
				    break;
				  case 2:
				    speech = "On Tuesday " + siteobj.site + " opens at " + siteobj.tuesdayopen + " and closes at " + siteobj.tuesdayclose;
				    break;
				  case 3:
				    speech = "On Wednesday " + siteobj.site + " opens at " + siteobj.wednesdayopen + " and closes at " + siteobj.wednesdayclose;
				    break;
				  case 4:
				    speech = "On Thursday " + siteobj.site + " opens at " + siteobj.thursdayopen + " and closes at " + siteobj.thursdayclose;
				    break;
				  case 5:
				    speech = "On Friday " + siteobj.site + " opens at " + siteobj.fridayopen + " and closes at " + siteobj.fridayclose;
				    break;
				  case 6:
				    speech = "On Saturday " + siteobj.site + " opens at " + siteobj.saturdayopen + " and closes at " + siteobj.saturdayclose;
				}
			}

			// assume that the site is currently extended closed
			// add a site picker option to find nearby to the site
			else {
				speech = siteobj.site + " is closed from " + siteobj.extendedclose + " and opens again on " + siteobj.extendedopen;
			}

		}
		//reprompt
		catch (e) {
			console.log('siteOpenIntent had something go wrong --------------------------------------------');
		}

		this.ask(this.t(speech), this.t('anythingelse.speech'));
	},

	whenSiteOpenIntent() {
/*
the kludge is strong in this one
	if sitename.key missing "is the library open" <implies now>
		-> library picker - check if site is extended close, then mention that and suggest a near by site?
	for now we assume that the site is asked for, or is central library

	if whenDate.key undef'd "open time albany library" <implied now>
		-> giveTime(sitename, now())
	else
		set the session var to now() and do the case


*/
		let speech = 'Hmm, ' + this.$inputs.sitename.key + ' doesn\'t ring a bell';

		try {
			// find this site and get the open/close times from our spreadsheet - if not siteobj is undefined > error
			let siteobj = this.$cms.OPENCLOSE.find(o => o.site === this.$inputs.sitename.key);
//console.log('whenSiteOpenIntent ' + siteobj.site + '-------------------);

// is {sitename} open {whendate}
/*			if (this.$inputs.whenDate.key !== "undefined" && this.$inputs.whenDate.key !== null) {
				var dayRequest = new Date(this.$inputs.whenDate.key);
			}
			else {
				var dayRequest = new Date();
			}
*/

//			var dayRequest = new Date();
			if (this.$inputs.whenDate.key !== "undefined" && this.$inputs.whenDate.key !== null) {
				var dayRequest = parseISOString(this.$inputs.whenDate.key);
 // = new Date(this.$inputs.whenDate.key);
			}


console.log(' dayRequest: ' + dayRequest.getDay());

			// extendedclose is either open or the date of reopen
			if (siteobj.extendedclose === '') {

				switch (dayRequest.getDay()) { //new Date(this.$inputs.whenDate.key).getDay()) {
				  case 0:
				    speech = "On a Sunday " + siteobj.site + " opens at " + siteobj.sundayopen + " and closes at " + siteobj.sundayclose;
				    break;
				  case 1:
				    speech = "On a Monday " + siteobj.site + " opens at " + siteobj.mondayopen + " and closes at " + siteobj.mondayclose;
				    break;
				  case 2:
				    speech = "On a Tuesday " + siteobj.site + " opens at " + siteobj.tuesdayopen + " and closes at " + siteobj.tuesdayclose;
				    break;
				  case 3:
				    speech = "On a Wednesday " + siteobj.site + " opens at " + siteobj.wednesdayopen + " and closes at " + siteobj.wednesdayclose;
				    break;
				  case 4:
				    speech = "On a Thursday " + siteobj.site + " opens at " + siteobj.thursdayopen + " and closes at " + siteobj.thursdayclose;
				    break;
				  case 5:
				    speech = "On a Friday " + siteobj.site + " opens at " + siteobj.fridayopen + " and closes at " + siteobj.fridayclose;
				    break;
				  case 6:
				    speech = "On a Saturday " + siteobj.site + " opens at " + siteobj.saturdayopen + " and closes at " + siteobj.saturdayclose;
				}
			}

			// assume that the site is currently extended closed
			// add a site picker option to find nearby to the site
			else {
				speech = siteobj.site + " is closed from " + siteobj.extendedclose + " and opens again on " + siteobj.extendedopen;
			}

		}
		//reprompt
		catch (e) {
			console.log('whenSiteOpenIntent had something go wrong --------------------------------------------');
		}

		this.ask(this.t(speech), this.t('anythingelse.speech'));
	},

	helpIntent() {
		let helpSpeech = 'Here I would offer some useful help speech\
				maybe try whatever you said slower or something';
		this.ask(this.t(helpSpeech));
	},

	cancelIntent() {
		let cancelSpeech = 'ok, cancelling that';
		this.ask(this.t(cancelSpeech));
	},

	// leaving here for future state things
	failBackIntent() {
		return this.toIntent('helpIntent');
//		this.ask(this.t(speech));
	},

	stopIntent() {
		let speech = 'Ok, talk to you later.';
		this.tell(this.t(speech));
	},
	
	HELP() {
		return this.toIntent(helpIntent);
	},
	
	END() {
		let speech = 'Ok, talk to you later.';
		this.tell(this.t(speech));
	}
		
});

// s is a ISO date string
// returns new date set to the content of the string
function parseISOString(s) {
	var b = s.split(/\D+/);
console.log(s, b);
	if (b.length = 3)
		return new Date(Date.UTC(b[0], --b[1], b[2]));
	else
		return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}

// siteHours is a JSON array, one site open close times lifted from googledoc
// day is a Date, the day the hours are requested for
// returns speech, string containing what needs to be said.
/*
function openHoursHelper(siteobj) { //, dayRequest) {
console.log('openhourshelper ');
console.log('trying openHoursHelper---------------', this.siteobj); //, this.dayRequest);
//console.log(siteobj.site);
//console.log(dayRequest);

	var speech = '';
	if (siteobj.extendedclose === '') {

		// alexa (at least) will return a date for now/tomorrow/next friday etc using system default slots.

		switch (dayRequest.getDay()) { //new Date(this.$inputs.whenDate.key).getDay()) {
		  case 0:
		    speech = "On Sunday " + siteobj.site + " opens at " + siteobj.sundayopen + " and closes at " + siteobj.sundayclose;
		    break;
		  case 1:
		    speech = "On Monday " + siteobj.site + " opens at " + siteobj.mondayopen + " and closes at " + siteobj.mondayclose;
		    break;
		  case 2:
		    speech = "On Tuesday " + siteobj.site + " opens at " + siteobj.tuesdayopen + " and closes at " + siteobj.tuesdayclose;
		    break;
		  case 3:
		    speech = "On Wednesday " + siteobj.site + " opens at " + siteobj.wednesdayopen + " and closes at " + siteobj.wednesdayclose;
		    break;
		  case 4:
		    speech = "On Thursday " + siteobj.site + " opens at " + siteobj.thursdayopen + " and closes at " + siteobj.thursdayclose;
		    break;
		  case 5:
		    speech = "On Friday " + siteobj.site + " opens at " + siteobj.fridayopen + " and closes at " + siteobj.fridayclose;
		    break;
		  case 6:
		    speech = "On Saturday " + siteobj.site + " opens at " + siteobj.saturdayopen + " and closes at " + siteobj.saturdayclose;
		}
	}

	// assume that the site is currently extended closed
	// add a site picker option to find nearby to the site
	else {
		speech = siteobj.site + " is closed from " + siteobj.extendedclose + " and opens again on " + siteobj.extendedopen;
	}

	return speech;
}
*/



module.exports.app = app;
