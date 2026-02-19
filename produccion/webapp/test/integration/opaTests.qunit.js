/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["produccion/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
