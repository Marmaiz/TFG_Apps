sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"entradas/test/integration/pages/EntradaList",
	"entradas/test/integration/pages/EntradaObjectPage"
], function (JourneyRunner, EntradaList, EntradaObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('entradas') + '/test/flp.html#app-preview',
        pages: {
			onTheEntradaList: EntradaList,
			onTheEntradaObjectPage: EntradaObjectPage
        },
        async: true
    });

    return runner;
});

