/*global QUnit*/

sap.ui.define([
	"pedidos/controller/Vista.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Vista Controller");

	QUnit.test("I should test the Vista controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
