// ------------------------------------------------------------------
// APP CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
	logging: true,

	intentMap: {
		'AMAZON.FallbackIntent': 'fallBackIntent',
		'AMAZON.CancelIntent': 'cancelIntent',
		'AMAZON.HelpIntent': 'defaultHelpIntent',
		'AMAZON.StopIntent': 'stopIntent',
	},

	db: {
		FileDb: {
			pathToFile: '../db/db.json',
		}
	},

	cms: {
		GoogleSheetsCMS: {
			spreadsheetId: '1BaykMM3IY0bAfpaYT2QiPc0shaGkGJzsu14pDL8b4LI',
			access: 'public',
			sheets: [{
					name: 'OPENCLOSE',
					type: 'ObjectArray',
					position: 1,
					range: 'A:T',
				}, {
					name: 'responses',
					type: 'Responses',
					position: 2,
				},{
					name: 'suburbSearch',
					type: 'KeyValue',
					position: 4,
				},{
					name: 'WiggleAndRhyme',
					type: 'ObjectArray',
					position: 5,
					range: 'A:I',
				},{
					name: 'RhymeTime',
					type: 'ObjectArray',
					position: 6,
					range: 'A:I',
				},{
					name: 'StoryTime',
					type: 'ObjectArray',
					position: 7,
					range: 'A:I',
				},
				
			],
			caching: false, 
		}
	}
};
