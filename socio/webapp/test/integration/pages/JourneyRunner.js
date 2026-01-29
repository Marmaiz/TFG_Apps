sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"socio/test/integration/pages/SocioList",
	"socio/test/integration/pages/SocioObjectPage"
], function (JourneyRunner, SocioList, SocioObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('socio') + '/test/flp.html#app-preview',
        pages: {
			onTheSocioList: SocioList,
			onTheSocioObjectPage: SocioObjectPage
        },
        async: true
    });

    return runner;
});

