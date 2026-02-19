sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast"
], (Controller, UIComponent, MessageToast) => {
    "use strict";

    return Controller.extend("pedidos.controller.ListadoPedidosPorProcesar", {
        onInit() {
        },

        onGestionar: function (oEvent) {
            MessageToast.show("Abriendo pedido...");

            var pedidoId = oEvent.getSource().getBindingContext().getObject().Id;
            console.log(pedidoId);
            let oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("ProcesarPedido",
                { Id: pedidoId }
            );
        },
        onNavBack: function () {
            const oView = this.getView();
            const oModel = oView.getModel();
            const oRouter = UIComponent.getRouterFor(this);

            oModel.refresh(true, true);
            oRouter.navTo("RoutePedidos");
        },

        onSearch: function (oEvent) {
/*             let aFilters = [];
            let sQuery = oEvent.getSource().getValue();

            if (sQuery && sQuery.length > 0) {
                aFilters.push(new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("Cliente/Nombre", sap.ui.model.FilterOperator.Contains, sQuery)
                    ]
                }));

                let oList = this.byId("tablaPedidosPorProcesar");
                let oBinding = oList.getBinding("items");
                oBinding.filter(aFilters);
            } */
             // Obtener el texto del SearchField
             const sQuery = oEvent.getParameter("newValue");
         
             // Obtener la tabla y su binding
             const oTable = this.byId("tablaPedidosPorProcesar");
             const oBinding = oTable.getBinding("items"); 
         
             if (!oBinding) return;
         
             // Crear filtro: buscamos coincidencias en Cliente/Nombre o en Id
             const aFilters = [];
             if (sQuery && sQuery.length > 0) {
                 aFilters.push(new sap.ui.model.Filter({
                     filters: [
                         new sap.ui.model.Filter("Cliente/Nombre", sap.ui.model.FilterOperator.Contains, sQuery)
                     ],
                     and: false // OR entre los filtros
                 }));
             }
         
             // Aplicar filtro al binding
             oBinding.filter(aFilters); 
        }
    });
});