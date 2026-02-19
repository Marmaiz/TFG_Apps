sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/UIComponent",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (Controller, UIComponent, MessageToast, MessageBox, Filter, FilterOperator) {
  "use strict";

  return Controller.extend("DetallePedido.controller.App", {
    onInit: function () {
      let oRouter = UIComponent.getRouterFor(this);
      oRouter.getRoute("DetallePedido").attachMatched(this._onRouteMatched, this);

    },
    _onRouteMatched: function (oEvent) {

      let sPedidoId, oView;
      sPedidoId = oEvent.getParameter("arguments").Id;
      oView = this.getView();

      oView.bindElement({
        path: `/Pedido(Id=guid'${sPedidoId}')`,
        events: {
          dataReceived: (oData) => {
            const oPedido = oView.getBindingContext().getObject();
            this.sEstado = oPedido.Estado_code;

            switch (this.sEstado) {
              case "F":
                oView.byId("btnEditarPedido").setEnabled(false);
                oView.byId("btnProcesarPedido").setEnabled(false);
                break;

              case "P":
                oView.byId("btnEditarPedido").setEnabled(true);
                oView.byId("btnProcesarPedido").setEnabled(false);
                break;

              default:
                oView.byId("btnEditarPedido").setEnabled(true);
                oView.byId("btnProcesarPedido").setEnabled(true);
                break;
            }

          }
        }
      })
    },

    /**
     * Metodo para el agregado de una línea a la Tabla
     */
    onAgregarLinea: function () {
      console.log("Agregar línea presionado")
      //var sValor = this.getView().byId("idInputNombre").getValue();

      var oView = this.getView();
      var oModel = this.getView().getModel();
      var elementView = this.getView().getElementBinding().getBoundContext().getObject();

      /*       if (!this._oDialogNuevaLinea) {
              this._oDialogNuevaLinea = sap.ui.xmlfragment(oView.getId(), "pedidos.view.NuevaLinea", this);
              oView.addDependent(this._oDialogNuevaLinea);
            } */

      //PARA OBTENER EL PEDIDO_ID
      // Obtener el Pedido actual desde el ElementBinding 
      const oPedido = oView.getElementBinding().getBoundContext().getObject();
      const pedidoId = oPedido.Id;

      // Crear estructura vacía 
      var newEntry = {
        Producto_Id: "",
        Variedad_Id: "",
        Calibre_Id: "",
        Caja_Id: "",
        Pedido_Id: pedidoId,
        Kilos: 0,
        /* Id,Producto_Id,Variedad_Id,Calibre_Id,Caja_Id,Pedido_Id,Kilos */
      };

      if (!this._oDialogNuevaLinea) {
        this._oDialogNuevaLinea = sap.ui.xmlfragment(
          oView.getId(),
          "pedidos.view.NuevaLinea",
          this
        );
        oView.addDependent(this._oDialogNuevaLinea);
      }

      this._oDialogNuevaLinea.open();
      /*Creo nuevo modelo para guardr los datos */
      var oModelNuevaLinea = new sap.ui.model.json.JSONModel();
      oModelNuevaLinea.setData(newEntry);

      /*seteo el modelo a la vista*/
      this.getView().setModel(oModelNuevaLinea, "NuevaLineaModel");
    },

    /**
     * Metodo para realizar la consulta a la BD y crear la linea
     */
    onConfirmarNuevaLinea: function () {
      /*       var oView = this.getView();
            var oNuevaLineaModel = this.getView().getModel("NuevaLineaModel");
            var oData = oNuevaLineaModel.getData();
            console.log(oData)
            this._oDialogNuevaLinea.close(); */

      /* solucion de chaty*/
      const oModel = this.getView().getModel();     // OData V2 model
      const oData = this.getView().getModel("NuevaLineaModel").getData();

      // Obtenemos el path del Pedido actual
      //const binding = oView.getElementBinding();
      // const pedidoPath = binding.getPath();  // "/Pedido(Id=guid'...')"

      // Path para crear la línea (sub-collection)
      //const lineaPath = pedidoPath + "/Linea";      
      const that = this;

      //oModel.create(lineaPath, oData, {
      oModel.create("/Linea", oData, {
        success: function (oCreatedData) {
          MessageToast.show("Línea creada correctamente");
          that._oDialogNuevaLinea.close();

          // Refrescar los datos del Pedido entero
          //binding.refresh(true);
          oModel.refresh(true);
        },
        error: function (oError) {
          console.error("Error al crear línea", oError);
          MessageBox.error("No se pudo crear la línea");
        }
      });
    },

    /**
     * Metodo para cancelar la creacion de una nueva linea
     */
    onCancelarNuevaLinea: function () {
      this._oDialogNuevaLinea.close();
    },

    onProductoSeleccionado: function (oEvent) {
      const sProductoId = oEvent.getSource().getSelectedKey();

      const oVariedadCombo = this.getView().byId("cbVariedad");
      const oBinding = oVariedadCombo.getBinding("items");

      oVariedadCombo.setEditable(true);

      // Limpiar selección previa
      this.getView().getModel("NuevaLineaModel").setProperty("/Variedad_Id", null);

      if (!sProductoId) {
        oBinding.filter([]);
        return;
      }

      const oFilter = new Filter({
        path: "Producto_Id",
        operator: FilterOperator.EQ,
        value1: sProductoId
      });

      oBinding.filter([oFilter]);
    },


/**
 * Metodo para eliminar una nueva linea
 */    onEliminarLinea: function () {

      const oTable = this.byId("tablaLineas");
      const oSelectedItem = oTable.getSelectedItem();
      var oContext = oSelectedItem.getBindingContext();

      const sPath = oContext.getPath();     // "/Pedido(key...)"

      const oModel = this.getView().getModel();

      // Confirmación
      MessageBox.confirm(
        "¿Seguro que quieres eliminar esta linea?",
        {
          onClose: (sAction) => {
            if (sAction !== MessageBox.Action.OK) return;

            oModel.remove(sPath, {
              success: function () {
                MessageToast.show("Linea eliminada correctamente");
                oModel.refresh(true);
              },
              error: function (oError) {
                let sMsg = "Error al eliminar linea";
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

    onEditPress: function (oEvent) {
      const oView = this.getView();

      // Pedido actual
      const oContext = oView.getElementBinding().getBoundContext();
      const oPedido = oContext.getObject();
      const sPath = oContext.getPath(); //
      var oEstado = this.sEstado;

      if (oEstado === "P") {
        // Confirmación
        MessageBox.warning(
          "El pedido está actualmente en PROCESO. Al editarlo volvera al estado CREADO ¿Desea igualmente modificarlo?",
          {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: (oAction) => {

              if (oAction === MessageBox.Action.YES) {
                // permitir edición
                this.onHacerEditable(true);
                this.onCambiarEstado("C",sPath);
              }

            }
          }
        );
      }
    },

    /**
     * Metodo para poder editar el pedido
     */
    onHacerEditable: function (editable) {
      const oView = this.getView();

      // afectamos todos los controles que necesiten editarse
      oView.byId("inputClientePedido").setEditable(editable);
      oView.byId("inputFechaPedido").setEditable(editable);
      oView.byId("btnAgregarLinea").setEnabled(editable);
      oView.byId("btnEliminarLinea").setEnabled(editable);

      oView.byId("btnGuardarPedido").setEnabled(editable);
      oView.byId("btnCancelarEdicion").setEnabled(editable);
    },

    onProcesarPedido: function () {

      const oView = this.getView();
      const oModel = oView.getModel();

      // Pedido actual
      const oContext = oView.getElementBinding().getBoundContext();
      const oPedido = oContext.getObject();
      const sPath = oContext.getPath(); // "/Pedido(Id=guid'...')"

      // UX básica (opcional)
      const aLineas = oPedido.Lineas;
      if (!aLineas || aLineas.length === 0) {
        MessageBox.error("El pedido no tiene líneas");
        return;
      }

      MessageBox.confirm(
        "¿Desea procesar el pedido?",
        {
          onClose: (sAction) => {
            if (sAction !== MessageBox.Action.OK) return;
              this.onCambiarEstado("P",sPath);
            // UPDATE directo al backend
            /*  oModel.update(sPath, {
               Estado_code: "P"
             }, {
               success: function () {
                 MessageToast.show("Pedido procesado correctamente");
                 oModel.refresh(true);
               },
               error: function (oError) {
                 let sMsg = "Error al procesar pedido";
                 try {
                   sMsg = JSON.parse(oError.responseText).error.message.value;
                 } catch (e) { }
                 MessageBox.error(sMsg);
               }
             });*/
          }
        }
      );
    },

    onCambiarEstado: function (estado, sPath) {
      const oView = this.getView();
      const oModel = oView.getModel();
      var that = this;
      

      oModel.update(sPath, {
        Estado_code: estado
      }, {
        success: function () {
          oModel.refresh(true,true);
        },
        error: function (oError) {
          let sMsg = "Error al _ pedido";
          try {
            sMsg = JSON.parse(oError.responseText).error.message.value;
          } catch (e) { }
          MessageBox.error(sMsg);
        }
      });
    },

    onNavBack: function () {
      const oView = this.getView();
      const oModel = oView.getModel();
      const oRouter = UIComponent.getRouterFor(this);

      // ❗ Cancelar cambios pendientes
      if (oModel.hasPendingChanges()) {
        oModel.resetChanges();
      }

      this.onHacerEditable(false);

      oModel.refresh(true, true);

      // Navegar atrás
      oRouter.navTo("RoutePedidos");
    },

    onGuardarPedido: function () {
      const oView = this.getView();
      const oModel = oView.getModel();

      if (!oModel.hasPendingChanges()) {
        //MessageToast.show("No hay cambios para guardar");
        this.onHacerEditable(false);
        return;
      }

      oView.setBusy(true);

      oModel.submitChanges({
        success: () => {
          oView.setBusy(false);
          MessageToast.show("Pedido guardado correctamente");

          this.onHacerEditable(false);
          oModel.refresh(true);
        },
        error: (oError) => {
          oView.setBusy(false);
          let sMsg = "Error al guardar el pedido";
          try {
            sMsg = JSON.parse(oError.responseText).error.message.value;
          } catch (e) { }
          MessageBox.error(sMsg);
        }
      });
    },

    onCancelarEdicion: function () {
      const oView = this.getView();
      const oModel = oView.getModel();

      if (oModel.hasPendingChanges()) {
        oModel.resetChanges();
      }

      this.onHacerEditable(false);
      MessageToast.show("Cambios descartados");
    },


  });
});