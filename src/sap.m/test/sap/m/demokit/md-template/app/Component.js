/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/core/UIComponent",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/demo/mdtemplate/model/models",
		"sap/ui/demo/mdtemplate/controller/ListSelector",
		"sap/ui/demo/mdtemplate/controller/BusyHandler",
		"sap/ui/demo/mdtemplate/controller/ErrorHandler",
		"sap/ui/demo/mdtemplate/model/formatter",
		"sap/ui/demo/mdtemplate/model/grouper"
	], function (UIComponent, ResourceModel, models, ListSelector, BusyHandler, ErrorHandler) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.mdtemplate.Component", {

		metadata : {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this method, the resource and application models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init : function () {
			var mConfig = this.getMetadata().getConfig();

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the internationalization model
			this.setModel(new ResourceModel({
				bundleName : mConfig.i18nBundle
			}), "i18n");

			this.oListSelector = new ListSelector();

			this._oErrorHandler = new ErrorHandler(this);
			// initialize the busy handler with the component
			this._oBusyHandler = new BusyHandler(this);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ListSelector and BusyHandler are destroyed.
		 * @public
		 * @override
		 */
		destroy : function () {
			this.oListSelector.destroy();
			this._oBusyHandler.destroy();
			this._oErrorHandler.destroy();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		/**
		 * In this method, the rootView is initialized and stored.
		 * @public
		 * @override
		 */
		createContent : function() {
			// set the app data model since the app controller needs it, we create this model very early
			var oAppModel = models.createODataModel({
				urlParametersForEveryRequest: [
					"sap-server",
					"sap-host",
					"sap-host-http",
					"sap-client",
					"sap-language"
				],
				url : this.getMetadata().getConfig().serviceUrl,
				config: {
					metadataUrlParams: {
						"sap-documentation": "heading"
					}
				}
			});

			this.setModel(oAppModel);
			this._createMetadataPromise(oAppModel);

			// call the base component's createContent function
			this._oRootView = UIComponent.prototype.createContent.apply(this, arguments);
			this._oRootView.addStyleClass(this.getCompactCozyClass());
			return this._oRootView;
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 */
		getCompactCozyClass : function() { // in 1.28 "Cozy" mode class does not exist yet, but keep the method name in sync with 1.30
			if (!this._sCompactCozyClass) {
				if (!sap.ui.Device.support.touch) { // apply compact mode if touch is not supported; this could me made configurable for the user on "combi" devices with touch AND mouse
					this._sCompactCozyClass = "sapUiSizeCompact";
				}
			}
			return this._sCompactCozyClass;
		},

		/**
		 * Creates a promise which is resolved when the metadata is loaded.
		 * @param {sap.ui.core.Model} oModel the app model
		 * @private
		 */
		_createMetadataPromise : function(oModel) {
			this.oWhenMetadataIsLoaded = new Promise(function (fnResolve, fnReject) {
				oModel.attachEventOnce("metadataLoaded", function() {
					fnResolve();
				});
				oModel.attachEventOnce("metadataFailed", function() {
					fnReject();
				});
			});
		}

	});

}, /* bExport= */ true);