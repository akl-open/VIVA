// ------------------------------------------------------------------
// JOVO PROJECT CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
    alexaSkill: {
       nlu: 'alexa',
    },
    googleAction: {
       nlu: 'dialogflow',
	endpoint: 'https://4c0srf66ib.execute-api.ap-northeast-1.amazonaws.com/beta',
    },
        endpoint: 'arn:aws:lambda:ap-northeast-1:897334292899:function:jovoHelloWorldAucklandCouncil'
//    endpoint: '${JOVO_WEBHOOK_URL}',
};
