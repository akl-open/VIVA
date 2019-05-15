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
		this.$session.$data.aboutWhen = new Date();
console.log('siteOpenIntent ' + this.$session.$data.aboutWhen + ' -------------------------');
		return this.toIntent('whenSiteOpenIntent');

//		this.tell(this.$inputs.sitename.key + ' is open at blah');
	},

	whenSiteOpenIntent() {
/*
	if sitename.key missing "is the library open" <implied now - will need to be a whenDate synonym?>
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

//console.log("1 about when");
//console.log(this.$session.$data.aboutWhen);

// is {sitename} open {whendate}
			if (this.$inputs.whenDate.key !== "undefined" && this.$inputs.whenDate.key !== null) {
				var dayRequest = new Date(this.$inputs.whenDate.value);
console.log('. dayreq.day ' + dayRequest.getDay());
console.log("1 after whenDate set -----------------------------");
			}
// is {sitename} open
			else if (this.$session.$data.aboutWhen !== "undefined" && this.$session.$data.aboutWhen !== null) {
				var dayRequest = new Date(this.$session.$data.aboutWhen);
//console.log(this.$session.$data.aboutWhen);
console.log('. dayreq.day ' + dayRequest.getDay());
console.log("2 after aboutWhen set -------------");

			}
// default
			else {
				let dayRequest = new Date(2019, 1, 1);
			}

console.log(' dayRequest: ' + dayRequest.getDay());
/*			if (typeof this.$session.$data.aboutWhen === "undefined" && this.$session.$data.aboutWhen === null)
				this.$session.$data.aboutWhen = new Date(tomorrow);
console.log('whenSiteOpen after aboutWhen ');
console.log(this.$session.$data.aboutWhen);
console.log(' this.$inputs.whenDate.key ');
console.log(this.$inputs.whenDate.key + '-----------------------------------');
*/
			// extendedclose is either open or the date of reopen
			if (siteobj.extendedclose === '') {

				// start off assuming .now, shall we
//todo after testing this function still works, set this to be either the input whenDate or the session aboutWhen date.
//				let dayRequest = new Date();

				// we now have the open and close hours of the site by day.
				// alexa (at least) will return a date for now/tomorrow/next friday etc using system default slots.

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
				    speech = "On a Saturday" + siteobj.site + " opens at " + siteobj.saturdayopen + " and closes at " + siteobj.saturdayclose;
//				    break;
//				  default:
//				    speech = "Hmm I had an issue with that day, can you try again";
				}
			}

			// assume that the site is currently extended closed
			// add a site picker option to find nearby to the site
			else {
				speech = siteobj.site + " is closed from " + siteobj.extendedclose + " and opens again on " + siteobj.extendedopen;
			}

//			speech = siteobj.site + " opens at " + siteobj.mondayopen + 'on Monday. Sample data only';
//			console.log(siteobj.site + " " + siteobj. + ' --------------------------------');

		}
		//reprompt
		catch (e) {
			console.log('not one \'oh mine...--------------------------------------------')
		}

		this.ask(this.t(speech), this.t('anythingelse.speech'));

/*
		// use this.$inputs.whenDate().key to retrieve the date
		let thisMoment = new Date();
		let speech = 'silence';
		console.log(' time now: ' + thisMoment.toString() + ' ------------------------------------');
		console.log(' time given: ' + this.$inputs.whenDate.key + ' ' + this.$inputs.whenDate.value + '----------------');

		try {
			let timeRequested = new Date(this.$inputs.whenDate.key);
			speech = timeRequested.toString() + '. ' + this.$inputs.whenDate.key + ' ' + this.$inputs.whenDate.value;
			this.ask(this.t(speech), this.t('anythingelse.speech'));
		}
		catch (e) {
			this.ask(this.t(speech));
		}
*/
	},

	HelpIntent() {
		let helpSpeech = "some useful help speech";
		this.ask(this.t(helpSpeech));
	},

	CancelIntent() {
		let cancelSpeech = "ok, cancel that";
		this.ask(this.t(cancelSpeech));
	},

	failBackIntent() {
		let speech = "hmm you what now?";
		this.ask(this.t(speech));
	},
});

module.exports.app = app;
