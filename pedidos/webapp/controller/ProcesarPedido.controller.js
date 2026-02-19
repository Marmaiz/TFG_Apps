sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/UIComponent",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
], (Controller, UIComponent, MessageToast, MessageBox) => {
  "use strict";

  return Controller.extend("pedidos.controller.ProcesarPedido", {
    onInit: function () {
      let oRouter = UIComponent.getRouterFor(this);
      oRouter.getRoute("ProcesarPedido").attachMatched(this._onRouteMatched, this);

    },

    _onRouteMatched: function (oEvent) {

      let sPedidoId, oView;
      sPedidoId = oEvent.getParameter("arguments").Id;
      oView = this.getView();

      oView.bindElement({
        path: `/Pedido(Id=guid'${sPedidoId}')`,

        parameters: {
          expand: "Cliente"
        }
      })
    },

    onAñadirEntrada: function (oEvent) {
      MessageToast.show("Añadiendo entrada...");
      var oView = this.getView();

      /*  // Línea actual 
       const oLineaCtx = oEvent.getSource().getBindingContext();
       const oLinea = oLineaCtx.getObject();
       this._sLineaId = oLinea.Id; */
      const oLinea = oEvent.getSource().getBindingContext().getObject();
      this._sLineaId = oLinea.Id;
      // Crear estructura vacía
      var newEntry = {
        Linea_Id: this._sLineaId,
        Entrada_Id: "",
        Kilos_Usados: 0,
      };

      if (!this._oDialogNuevaEntrada) {
        this._oDialogNuevaEntrada = sap.ui.xmlfragment(
          "pedidos.view.NuevaEntrada",
          this
        );
        oView.addDependent(this._oDialogNuevaEntrada);
      }

      this._oDialogNuevaEntrada.open();

      /*Creo nuevo modelo para guardar los datos */
      var oModelNuevaEntrada = new sap.ui.model.json.JSONModel();
      oModelNuevaEntrada.setData(newEntry);

      /*seteo el modelo a la vista*/
      this.getView().setModel(oModelNuevaEntrada, "NuevaEntradaModel");
    },

    /**
 * Metodo para cancelar la creacion de una nueva linea
 * onCancelarDialog: function () {
 */
    onCancelarEntrada: function () {

      this._oDialogNuevaEntrada.close();
    },

    onConfirmarEntrada: function (oEvent) {
      const oItem = oEvent.getParameter("selectedItem");
      const oCtx = oItem.getBindingContext();
      const oEntrada = oCtx.getObject();

      const oNuevaEntradaModel = this.getView().getModel("NuevaEntradaModel");
      const oData = oNuevaEntradaModel.getData();

      // ASIGNAR Entrada_Id
      oData.Entrada_Id = oEntrada.Id;
      if (!oItem) {
        MessageBox.error("No se ha seleccionado ninguna entrada");
        return;
      }
      /*     if (!oData.Kilos_Usados || oData.Kilos_Usados <= 0) {
              MessageToast.show("Introduce los kilos a utilizar");
              return;
          } */

      const oModel = this.getView().getModel();
      const that = this;
      console.log(oData);
      oModel.create("/Trazabilidad", oData, {
        success: function () {
          MessageToast.show("Entrada asignada correctamente");
          oModel.refresh(true);
        },
        error: function (oError) {
          console.error("Error al asignar la línea", oError);
          MessageBox.error("No se pudo asignar la entrada");
        }
      });
    },


    onAsignarEntrada: function (oEvent) {
      var oView = this.getView();
      // Guardamos el id de la línea seleccionada
      var oLinea = oEvent.getSource().getBindingContext().getObject();
      this._oLineaSeleccionada = oLinea; // Se guarda la línea en una Vglobal para poder utilizarla en la ayuda de busqueda
      //Se genera la nueva entrada para el formulario
      var newEntry = {
        Linea_Id: oLinea.Id,
        Entrada_Id: "",
        Kilos_Usados: 0,
        Kilos_Merma: 0
      };
console.log(newEntry);
      if (!this._oDialogAsignarEntrada) {
        this._oDialogAsignarEntrada = sap.ui.xmlfragment(
          "pedidos.view.AsignarEntrada",
          this
        );
        oView.addDependent(this._oDialogAsignarEntrada);
      }

      this._oDialogAsignarEntrada.open();

      /*Creo nuevo modelo para guardar los datos */
      var oModelAsignarEntrada = new sap.ui.model.json.JSONModel();
      oModelAsignarEntrada.setData(newEntry);

      /*seteo el modelo a la vista*/
      this.getView().setModel(oModelAsignarEntrada, "AsignarEntradaModel");
    },

    onConfirmAsignarEntrada: function (oEvent) {

      var oModelAsignarEntrada = this.getView().getModel("AsignarEntradaModel");
      var oDataAsignarEntrada = oModelAsignarEntrada.getData();
      console.log(oDataAsignarEntrada)
      var correcto = false;
      //comprobamos los datos obligatorios
      if (oDataAsignarEntrada && oDataAsignarEntrada.Entrada_Id && oDataAsignarEntrada.Kilos_Usados > 0) {
        correcto = true;
      }

      if (correcto) {
        //creamos
        MessageBox.confirm(this.getView().getModel("i18n").getProperty("confirm_asignarEntrada"), {
          onClose: function (oAction) {
            if (oAction === MessageBox.Action.OK) {
              this._submitAsignarEntrada(oEvent);
            }
          }.bind(this)
        });
      } else {
        MessageBox.error(this.getView().getModel("i18n").getProperty("error_requiredfields"))
      }

    },

    onCancelDialog: function (oEvent) {
      oEvent.getSource().getParent().close();
    },


    //Método que llama a la ayuda de busqueda de entradas disponibles
    onValueHelpPress: function (oEvent) {
      var oView = this.getView();


      if (!this._oLineaSeleccionada) {
        MessageBox.error("No se ha seleccionado ninguna línea");
        return;
      }

      // creo una variable donde almaceno la variedad para luego filtrar solo esas entradas
      var oVariedadId = this._oLineaSeleccionada.Variedad_Id;

      if (!oVariedadId) {
        MessageBox.error("La línea no tiene producto");
        return;
      }

      if (!this._oDialogNuevaEntrada) {
        this._oDialogNuevaEntrada = sap.ui.xmlfragment(
          "pedidos.view.NuevaEntrada",
          this
        );
        oView.addDependent(this._oDialogNuevaEntrada);
      }

      // Esperar a que el binding exista
      var oBinding = this._oDialogNuevaEntrada.getBinding("items");
      // filtro las entradas donde sean Greater Than GT 0 los kilos y Equal EQ a la variedad del producto
      if (oBinding) {
        const aFilters = [
          new sap.ui.model.Filter(
            "Kilos_disponibles",
            sap.ui.model.FilterOperator.GT,
            0
          ),
          new sap.ui.model.Filter(
            "Variedad_Id",
            sap.ui.model.FilterOperator.EQ,
            oVariedadId
          )
        ];
        oBinding.filter(aFilters);
      }
      this._oDialogNuevaEntrada.open();

    },

    onSelectEntrada: function (oEvent) {
      var oModelAsignarEntrada = this.getView().getModel("AsignarEntradaModel");
      const oEntrada = oEvent.getParameter("selectedItem").getBindingContext().getObject();

      oModelAsignarEntrada.setProperty("/Entrada_Id", oEntrada.Id);
      oModelAsignarEntrada.setProperty("/Kilos_Disponibles", oEntrada.Kilos);

    },

    _submitAsignarEntrada: function (oEvent) {
      var oModel = this.getView().getModel();
      var oModelAsignarEntrada = this.getView().getModel("AsignarEntradaModel");
      var data = oModelAsignarEntrada.getData();
      var that = this;

      this.getView().setBusy(true);
      this.getView().setBusyIndicatorDelay(0);
      this._oDialogAsignarEntrada.setBusy(true);
      this._oDialogAsignarEntrada.setBusyIndicatorDelay(0);

      var body = {
        Linea_Id: data.Linea_Id,
        Entrada_Id: data.Entrada_Id,
        Kilos_Usados: data.Kilos_Usados,
        Kilos_Merma: data.Kilos_Merma
      };

      oModel.create("/Trazabilidad", body, {
        success: function (oData, resp) {
          that.getView().setBusy(false);
          that._oDialogAsignarEntrada.setBusy(false);
          that._oDialogAsignarEntrada.close();
          that.getView().getModel().refresh(true, true);
        },

        error: function (error) {
          if (error && error.responseText) {
            var errorBody = JSON.parse(error.responseText);
            MessageBox.error(errorBody.error.code + " - " + errorBody.error.message.value)
          }
          that.getView().setBusy(false);
          that._oDialogAsignarEntrada.setBusy(false);
        }
      });
    },

    onfinalizarPedido: function () {
      const oView = this.getView();
      const oModel = oView.getModel();
      const oCtx = oView.getBindingContext();
      const oRouter = UIComponent.getRouterFor(this);

      const sPedidoId = oCtx.getProperty("Id");
      if (!oCtx) {
        MessageBox.error("No se pudo obtener el pedido actual");
        return;
      }
      MessageBox.confirm("¿Deseas finalizar el pedido?", {
        onClose: function (oAction) {

          if (oAction !== MessageBox.Action.OK) {
            return;
          }

          oView.setBusy(true);

          oModel.update(
            `/Pedido(Id=guid'${sPedidoId}')`,
            { Estado_code: 'F' },
            {
              success: function () {
                oView.setBusy(false);
                MessageToast.show("Pedido finalizado");
                oModel.refresh(true, true);

                oRouter.navTo("ListadoPedidosPorProcesar");
              },
              error: function (oError) {
                oView.setBusy(false);
                const err = JSON.parse(oError.responseText);
                MessageBox.error(err.error.message.value);
              }
            }
          );
        }
      });
    },













  });
});