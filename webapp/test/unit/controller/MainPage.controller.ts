/*global QUnit*/
import Controller from "com/mehran/portfolio/zui5portfolio/controller/Main.controller";

QUnit.module("Main Controller");

QUnit.test("I should test the Main controller", function (assert: Assert) {
	const oAppController = new Controller("Main");
	assert.ok(oAppController);
	oAppController.onInit();
	assert.ok(true, "Main controller initializes without a view");
});