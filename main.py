import requests
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

# URL del server per recuperare i dati della centralina
URL = "http://ia.didavallone.ovh:3000/readings/getlastvalue?serialnumber=SN4321"

# Funzione per recuperare i dati dal server
def get_data():
    try:
        response = requests.get(URL)
        response.raise_for_status()  # Solleva un'eccezione se lo status non è 200
        data = response.json()       # Converte la risposta in JSON
        
        # Se il JSON è una lista, prendiamo il primo elemento
        if isinstance(data, list) and len(data) > 0:
            data = data[0]
            
        return data
    except requests.exceptions.RequestException as e:
        return {"error": f"Errore nel recupero dei dati: {e}"}

# Comando /start: mostra tutti i comandi disponibili
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    message = (
        "Ciao! Usa i seguenti comandi per ottenere i dati della centralina:\n"
        "/temperatura - Temperatura (°C)\n"
        "/pressione - Pressione (hPa)\n"
        "/pm10 - Valore di PM10 (µg/m³)\n"
        "/pm25 - Valore di PM2.5 (µg/m³)\n"
        "/co2 - Valore di CO2 (ppm)\n"
        "/tvoc - Valore di TVOC (ppb)\n"
        "/luogo - Mostra città e indirizzo\n"
        "/timestamp - Ultimo aggiornamento dei dati"
    )
    await update.message.reply_text(message)

# Funzione generica per inviare un valore specifico
async def send_value(update: Update, field: str, label: str, unit: str) -> None:
    data = get_data()
    if "error" in data:
        await update.message.reply_text(data["error"])
        return
    value = data.get(field, "Dati non disponibili")
    await update.message.reply_text(f"{label}: {value} {unit}")

# Comando /temperatura (usa il campo "TEMP")
async def temperatura(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await send_value(update, "TEMP", "Temperatura", "°C")

# Comando /pressione (usa il campo "PRESS")
async def pressione(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await send_value(update, "PRESS", "Pressione", "hPa")

# Comando /pm10
async def pm10(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await send_value(update, "PM10", "PM10", "µg/m³")

# Comando /pm25
async def pm25(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await send_value(update, "PM25", "PM2.5", "µg/m³")

# Comando /co2
async def co2(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await send_value(update, "CO2", "CO2", "ppm")

# Comando /tvoc
async def tvoc(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await send_value(update, "TVOC", "TVOC", "ppb")

# Comando /luogo (città e indirizzo)
async def luogo(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    data = get_data()
    if "error" in data:
        await update.message.reply_text(data["error"])
    else:
        city = data.get("city", "Dati non disponibili")
        address = data.get("address", "Dati non disponibili")
        await update.message.reply_text(f"Luogo: {city}, {address}")

# Comando /timestamp
async def timestamp(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await send_value(update, "timestamp", "Timestamp", "")

# Funzione principale
def main() -> None:
    TOKEN = "8038294522:AAEBGWL6lQdMImDfSfhT2RudP5EDtU-CzjQ"  # Il token del bot
    application = Application.builder().token(TOKEN).build()

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
