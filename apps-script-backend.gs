/**
 * Google Apps Script - Backend para Comentarios y Sugerencias
 * Hospital San Diego de Alcalá
 * 
 * INSTRUCCIONES:
 * 1. Abre tu hoja de Google Sheets
 * 2. Ve a Extensiones > Apps Script
 * 3. Borra todo el código existente y pega este código
 * 4. Guarda (Ctrl+S / Cmd+S)
 * 5. Despliega como Web App:
 *    - Implementar > Nueva implementación
 *    - Tipo: Aplicación Web
 *    - Ejecutar como: Tu cuenta
 *    - Acceso: Cualquier persona
 * 6. Copia la URL que te da y pégala en Vercel como APPS_SCRIPT_URL
 */

// Función que recibe los datos desde Vercel
function doPost(e) {
  try {
    // Parsear los datos recibidos
    const data = JSON.parse(e.postData.contents);
    
    // Obtener la hoja activa (o la primera hoja)
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Formatear la fecha en español de México
    const fecha = new Date().toLocaleString('es-MX', { 
      timeZone: 'America/Hermosillo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Preparar la fila de datos según los encabezados
    const rowData = [
      fecha,                                    // Fecha
      data.type || '',                          // Tipo (Queja/Sug./Feliz.)
      data.category || '',                      // Categoría
      data.description || '',                   // Descripción
      data.contact?.name || 'Anónimo',          // Nombre del Paciente
      data.contact?.phone || 'N/A',             // Teléfono de Contacto
      data.sentiment || 'N/A',                  // Sentimiento (IA)
      data.recommendations || ''                // Recomendaciones (IA)
    ];
    
    // Agregar la fila a la hoja
    sheet.appendRow(rowData);
    
    // Responder con éxito
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Datos guardados correctamente' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Responder con error
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Función para probar el script (opcional)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: 'online', 
      message: 'Backend de Comentarios y Sugerencias - Hospital San Diego de Alcalá' 
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
