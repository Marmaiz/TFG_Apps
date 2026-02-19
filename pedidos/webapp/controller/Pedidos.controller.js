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

        onConfirmarNuevoPedido: function () {
            /* var oView = this.getView();
            var oModelNuevoPedido = this.getView().getModel("NuevoPedidoModel");
            var oData = oModelNuevoPedido.getData();
            console.log(oData) */
            const oModel = this.getView().getModel();     // OData V2 model
            const oData = this.getView().getModel("NuevoPedidoModel").getData();
            const that = this;

            oModel.create("/Pedido", oData, {
                success: function () {
                    MessageToast.show("Pedido creado correctamente");

                    that._oDialogNuevoPedido.close();

                    // Refrescar tabla
                    oModel.refresh(true);
                },
                error: function (oError) {
                    console.error("Error al crear pedido", oError);
                    MessageBox.error("No se pudo crear el pedido");
                }
            });

            this._oDialogNuevoPedido.close();
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