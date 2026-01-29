sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"calibres/test/integration/pages/CalibreList",
	"calibres/test/integration/pages/CalibreObjectPage"
], function (JourneyRunner, CalibreList, CalibreObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('calibres') + '/test/flp.html#app-preview',
        pages: {
			onTheCalibreList: CalibreList,
			onTheCalibreObjectPage: CalibreObjectPage
        },
        async: true
    });

    return runner;
});

