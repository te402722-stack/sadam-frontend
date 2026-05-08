import api from "../api";

function RecordatorioCard({ recordatorio, onActualizar }) {

  const marcarHecho = async () => {
    try {
     
      await api.post("/completar-recordatorio", {
        id_recordatorio: recordatorio.id_recordatorio,
        id_adulto: recordatorio.id_adulto || 1 
      });

      onActualizar();
    } catch (error) {
      console.error("Error al completar:", error);
    }
  };

  const omitir = () => {
    onActualizar();
  };

  return (
    <div style={styles.card}>
      <h3>🔔 Recordatorio</h3>

      <p style={styles.tipo}>{recordatorio.tipo}</p>

      <p>Hora: {recordatorio.hora}</p>

      <div style={styles.botones}>
        <button style={styles.hecho} onClick={marcarHecho}>
          ✓ Hecho
        </button>

        <button style={styles.omitir} onClick={omitir}>
          Omitir
        </button>
      </div>
    </div>
  );
}

export default RecordatorioCard;

const styles = {
  card: {
    position: "fixed",
    bottom: "80px",
    right: "20px",
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    width: "250px",
    zIndex: 1000
  },
  tipo: {
    fontWeight: "bold",
    fontSize: "18px"
  },
  botones: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px"
  },
  hecho: {
    background: "#4CAF50",
    color: "white",
    border: "none",
    padding: "8px",
    borderRadius: "5px"
  },
  omitir: {
    background: "#f44336",
    color: "white",
    border: "none",
    padding: "8px",
    borderRadius: "5px"
  }
};