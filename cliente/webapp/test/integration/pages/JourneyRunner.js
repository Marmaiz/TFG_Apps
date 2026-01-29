sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"cliente/test/integration/pages/ClienteList",
	"cliente/test/integration/pages/ClienteObjectPage"
], function (JourneyRunner, ClienteList, ClienteObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('cliente') + '/test/flp.html#app-preview',
        pages: {
			onTheClienteList: ClienteList,
			onTheClienteObjectPage: ClienteObjectPage
        },
        async: true
    });

    return runner;
});

