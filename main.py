import requests
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

# URL per ottenere i dati della centralina
URL = "http://ia.didavallone.ovh:3000/readings/getlastvalue?serialnumber=SN12354"

# Funzione per recuperare i dati dal server
def get_data():
    try:
        response = requests.get(URL)
        response.raise_for_status()  # Solleva un'eccezione per errori HTTP
        data = response.json()       # Converte la risposta in JSON
        
        # Se il JSON è una lista, prendiamo il primo elemento
        if isinstance(data, list) and len(data) > 0:
            data = data[0]
            
        return data
    except requests.exceptions.RequestException as e:
        return {"error": f"Errore nel recupero dei dati: {e}"}

# Comando /start
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "Ciao! Usa i seguenti comandi per ottenere i dati della centralina:\n"
        "/temperatura - Temperatura (°C)\n"
        "/pressione - Pressione (hPa)\n"
        "/pm10 - Livello di PM10 (µg/m³)\n"
        "/pm25 - Livello di PM2.5 (µg/m³)\n"
        "/co2 - Livello di CO2 (ppm)\n"
        "/tvoc - Livello di TVOC (ppb)\n"
        "/luogo - Posizione della centralina\n"
        "/timestamp - Ultima misurazione registrata"
    )

# Comando per la temperatura
async def temperatura(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    data = get_data()
    if "error" in data:
        await update.message.reply_text(data["error"])
    else:
        temperatura = data.get("temp", "Dati non disponibili")
        await update.message.reply_text(f"Temperatura: {temperatura} °C")

# Comando per la pressione
async def pressione(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    data = get_data()
    if "error" in data:
        await update.message.reply_text(data["error"])
    else:
        pressione = data.get("press", "Dati non disponibili")
        await update.message.reply_text(f"Pressione: {pressione} hPa")

# Comando per PM10
async def pm10(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    data = get_data()
    if "error" in data:
        await update.message.reply_text(data["error"])
    else:
        pm10 = data.get("PM10", "Dati non disponibili")
        await update.message.reply_text(f"Il valore di PM10 è: {pm10} µg/m³")

# Comando per PM2.5
async def pm25(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    data = get_data()
    if "error" in data:
        await update.message.reply_text(data["error"])
    else:
        pm25 = data.get("PM25", "Dati non disponibili")
        await update.message.reply_text(f"Il valore di PM2.5 è: {pm25} µg/m³")

# Comando per CO2
async def co2(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    data = get_data()
    if "error" in data:
        await update.message.reply_text(data["error"])
    else:
        co2 = data.get("CO2", "Dati non disponibili")
        await update.message.reply_text(f"Il valore di CO2 è: {co2} ppm")

# Comando per TVOC
async def tvoc(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    data = get_data()
    if "error" in data:
        await update.message.reply_text(data["error"])
    else:
        tvoc = data.get("TVOC", "Dati non disponibili")
        await update.message.reply_text(f"Il valore di TVOC è: {tvoc} ppb")

# Comando per ottenere il luogo (città e indirizzo)
async def luogo(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    data = get_data()
    if "error" in data:
        await update.message.reply_text(data["error"])
    else:
        citta = data.get("city", "Dati non disponibili")
        indirizzo = data.get("address", "Dati non disponibili")
        await update.message.reply_text(f"Luogo: {citta}, {indirizzo}")

# Comando per ottenere il timestamp
async def timestamp(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    data = get_data()
    if "error" in data:
        await update.message.reply_text(data["error"])
    else:
        timestamp = data.get("timestamp", "Timestamp non disponibile")
        await update.message.reply_text(f"Il timestamp dei dati è: {timestamp}")

# Funzione principale
def main() -> None:
    application = Application.builder().token("8038294522:AAEBGWL6lQdMImDfSfhT2RudP5EDtU-CzjQ").build()

    # Aggiunta dei gestori per i comandi
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("temperatura", temperatura))
    application.add_handler(CommandHandler("pressione", pressione))
    application.add_handler(CommandHandler("pm10", pm10))
    application.add_handler(CommandHandler("pm25", pm25))
    application.add_handler(CommandHandler("co2", co2))
    application.add_handler(CommandHandler("tvoc", tvoc))
    application.add_handler(CommandHandler("luogo", luogo))
    application.add_handler(CommandHandler("timestamp", timestamp))

    # Avvia il polling del bot
    application.run_polling()

if __name__ == "__main__":
    main()
