const restarDiasAFecha = (fecha, dias) => {
    fecha.setDate(fecha.getDate() + dias);
    return fecha;
  }
export default restarDiasAFecha;