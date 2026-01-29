sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"productos/test/integration/pages/ProductoList",
	"productos/test/integration/pages/ProductoObjectPage"
], function (JourneyRunner, ProductoList, ProductoObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('productos') + '/test/flp.html#app-preview',
        pages: {
			onTheProductoList: ProductoList,
			onTheProductoObjectPage: ProductoObjectPage
        },
        async: true
    });

    return runner;
});

