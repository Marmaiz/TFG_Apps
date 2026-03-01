sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, UIComponent, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("pedidos.controller.Pedidos", {
        onInit() {

        },

        onCrearPedido: function (oEvent) {
            MessageToast.show("Creando pedido...");

            /* let oRouter = UIComponent.getRouterFor(this);
             oRouter.navTo("DetallePedido",
                 {},
             );*/


            var oView = this.getView();

            // Crear estructura vacía
            var newEntry = {
                Cliente_Id: "",
                Fecha_Pedido: null,
                Estado_code: "C"
            };

            if (!this._oDialogNuevoPedido) {
                this._oDialogNuevoPedido = sap.ui.xmlfragment(
                    "pedidos.view.NuevoPedido",
                    this
                );
                oView.addDependent(this._oDialogNuevoPedido);
            }

            this._oDialogNuevoPedido.open();
            /*Creo nuevo modelo para guardr los datos */
            var oModelNuevoPedido = new sap.ui.model.json.JSONModel();
            oModelNuevoPedido.setData(newEntry);

            /*seteo el modelo a la vista*/
            this.getView().setModel(oModelNuevoPedido, "NuevoPedidoModel");

        },

        onConfirmarNuevoPedido: function (oEvent) {
            var oModelNuevoPedido = this.getView().getModel("NuevoPedidoModel");
            var oDataNuevoPedido = oModelNuevoPedido.getData();
            var correcto = false;

            //comprobamos los datos obligatorios
            if (oDataNuevoPedido.Cliente_Id && oDataNuevoPedido.Fecha_Pedido) {
                correcto = true;
            }

            if (correcto) {
                MessageBox.confirm(this.getView().getModel("i18n").getProperty("confirm_crearPedido"), {
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.OK) {
                            this._submitCrearPedido();
                        }
                    }.bind(this)
                });
            }
            else {
                MessageBox.error(this.getView().getModel("i18n").getProperty("error_requiredfields"))
            }
        },

        _submitCrearPedido: function () {
            var oModel = this.getView().getModel();     // OData V2 model
            var oData = this.getView().getModel("NuevoPedidoModel").getData();
            var that = this;

            this.getView().setBusy(true);
            this.getView().setBusyIndicatorDelay(0);
            this._oDialogNuevoPedido.setBusy(true);
            this._oDialogNuevoPedido.setBusyIndicatorDelay(0);

            oModel.create("/Pedido", oData, {
                success: function () {                   
                    that.getView().setBusy(false);
                    that._oDialogNuevoPedido.setBusy(false);
                    that._oDialogNuevoPedido.close();
                    MessageToast.show(that.getView().getModel("i18n").getProperty("success_crearPedido"));
                    
                    // Refrescar tabla
                    oModel.refresh(true, true);
                },
                error: function (oError) {
                    if (oError && oError.responseText) {
                        var oErrorBody = JSON.parse(oError.responseText);
                        MessageBox.error(oErrorBody.oError.code + " - " + oErrorBody.oError.message.value)
                    }
                    that.getView().setBusy(false);
                    that._oDialogNuevoPedido.setBusy(false);
                }
            });
        },

        onCancelarNuevoPedido: function () {
            this._oDialogNuevoPedido.close();
        },


        onEliminarPedido: function () {

            const oTable = this.byId("tablaPedidos");
            const oSelectedItem = oTable.getSelectedItem();
            var oContext = oSelectedItem.getBindingContext();

            const sPath = oContext.getPath();     // "/Pedido(key...)"

            const oModel = this.getView().getModel();

            // Confirmación
            MessageBox.confirm(
                "¿Seguro que quieres eliminar este pedido?",
                {
                    onClose: (sAction) => {
                        if (sAction !== MessageBox.Action.OK) return;

                        oModel.remove(sPath, {
                            success: function () {
                                MessageToast.show("Pedido eliminado correctamente");
                                oModel.refresh(true);
                            },
                            error: function (oError) {
                                let sMsg = "Error al eliminar el pedido";
                                try {
                                    sMsg = JSON.parse(oError.responseText).error.message.value;
                                } catch (e) { }
                                MessageBox.error(sMsg);
                            }
                        });
                    }
                }
            );
        },

        /**
        * Metodo para abrir la vista donde estan los detalles del pedido seleccionado
        */
        onDetail: function (oEvent) {
            MessageToast.show("Abriendo pedido...");

            var pedidoId = oEvent.getSource().getBindingContext().getObject().Id;
            let oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("DetallePedido",
                { Id: pedidoId }
            );
        },

        onProcesarPedidos: function () {
            MessageToast.show("Procesando pedidos...");
            let oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("ListadoPedidosPorProcesar",
                {}
            );
        },

        onPress: function (evt) {
            MessageToast.show(evt.getSource().getId() + " Pressed");
        },

        onTabSelect: function (oEvent) {
            const sKey = oEvent.getParameter("key");
            const oTable = this.byId("tablaPedidos");
            //const oBinding = oTable.getBinding("rows");
            const oBinding = oTable.getBinding("items");

            if (!oBinding) return;

            if (sKey === "ALL") {
                oBinding.filter([]);
                return;
            }

            const oFilter = new sap.ui.model.Filter(
                "Estado_code",
                sap.ui.model.FilterOperator.EQ,
                sKey
            );

            oBinding.filter([oFilter]);
        },

        formatter: {
            estadoColor: function (sEstado) {
                switch (sEstado) {
                    case "C": return "Information";
                    case "P": return "Warning";
                    case "F": return "Success";
                    default: return "None";
                }
            }
        }

    });
});