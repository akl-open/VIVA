// ------------------------------------------------------------------
// APP CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
	logging: true,

	intentMap: {
		'AMAZON.FallbackInent': 'failbackIntent',
		'AMAZON.CancelIntent': 'cancelIntent',
		'AMAZON.HelpIntent': 'helpIntent',
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
					name: 'bob',
					type: 'KeyValue',
					position: 5,
				},
				
			],
			caching: false, 
		}
	}
};
