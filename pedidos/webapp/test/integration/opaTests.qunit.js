/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["pedidos/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
