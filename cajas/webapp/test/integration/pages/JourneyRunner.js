sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"cajas/test/integration/pages/CajaList",
	"cajas/test/integration/pages/CajaObjectPage"
], function (JourneyRunner, CajaList, CajaObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('cajas') + '/test/flp.html#app-preview',
        pages: {
			onTheCajaList: CajaList,
			onTheCajaObjectPage: CajaObjectPage
        },
        async: true
    });

    return runner;
});

