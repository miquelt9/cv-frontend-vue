import { jutge_api_client } from './jutge_api_client.js'; // Asegúrate que este archivo y cliente existen y están configurados
import { verilog } from './verilog.js'; // Asumo que esto es un objeto o módulo que exporta la función exportVerilog
import { showMessage } from '#/simulator/src/utils'; // Asegúrate que la ruta es correcta
import { usePromptStore } from '#/store/promptStore'; // Asegúrate que la ruta es correcta

/**
 * Muestra un diálogo para obtener credenciales, exporta el circuito a Verilog y lo envía a Jutge.
 */
export async function sendToJutge() {
  const promptStore = usePromptStore();

  try {
    // 1. Muestra el diálogo de autenticación y espera las credenciales
    promptStore.auth.activate = true;
    // Asigna la función resolve de la promesa actual al store para que el diálogo pueda llamarla
    const credentials = await new Promise((resolve) => {
      promptStore.resolvePromise = resolve;
    });

    // Desactiva el diálogo independientemente del resultado para limpiar el estado
    promptStore.auth.activate = false;

    if (!credentials) {
      // El usuario canceló el diálogo (AuthDialog.vue debería resolver con null o undefined)
      console.log('Envío a Jutge cancelado por el usuario.');
      // showMessage('Envío a Jutge cancelado.'); // Opcional: mensaje de cancelación
      return;
    }

    const { email, password } = credentials;

    if (!email || !password) {
      // Esto no debería ocurrir si el botón de Login en AuthDialog.vue está deshabilitado
      // hasta que ambos campos estén rellenos.
      showMessage('Email y contraseña son obligatorios.', 'error'); // Usar showMessage o similar para errores
      return;
    }

    // 2. Autenticar (Aquí necesitarás tu cliente API de Jutge)
    // Muestra un mensaje de "cargando" o similar
    showMessage('Authenticating with Jutge...', 'info');
    const { token, error: loginError } = await jutge_api_client.auth.login({ email, password });
    console.log('Login response:', { token, loginError });

    if (loginError || !token) { // Comprueba también si el token está vacío
      showMessage(`Login failed: ${loginError || 'Unknown error'}`, 'error');
      return;
    }

    // Configura el token para futuras llamadas API (esto depende de cómo funcione tu jutge_api_client)
    jutge_api_client.meta = { token }; // O como sea que tu cliente maneje los tokens

    // 3. Exportar el circuito como código Verilog
    showMessage('Exporting circuit to Verilog...', 'info');
    const verilogCode = verilog.exportVerilog(); // Asegúrate que esta función existe y funciona
    console.log('Exported Verilog:', verilogCode);

    if (!verilogCode || verilogCode.trim() === '') {
        showMessage('Failed to export circuit to Verilog. Ensure the circuit is valid.', 'error');
        return;
    }

    // 4. Enviar la solución
    // Considera hacer problem_id dinámico si es necesario
    const problem_id = 'X64345_en'; // Podrías obtener esto de alguna parte, quizás otro diálogo
    showMessage(`Submitting solution for problem ${problem_id} to Jutge...`, 'info');

    const submissionResult = await jutge_api_client.student.submissions.submit({
      problem_id: problem_id,
      compiler_id: 'Circuits', // Asegúrate que este es el ID de compilador correcto
      code: verilogCode,
      annotation: '' // O alguna anotación relevante
    });
    console.log('Submission Result:', submissionResult);

    if (submissionResult.error) {
      showMessage(`Submission error: ${submissionResult.error}`, 'error');
    } else {
      // Aquí podrías querer mostrar más detalles del submissionResult si están disponibles
      showMessage('Circuit was successfully submitted to https://www.jutge.org. Submission ID: ' + submissionResult.id , 'success'); // Asumiendo que hay un ID de envío
    }

  } catch (err) {
    console.error('Error in sendToJutge:', err);
    // Desactiva el diálogo en caso de error no controlado para evitar que se quede colgado
    if (promptStore.auth.activate) {
        promptStore.auth.activate = false;
    }
    showMessage(`An unexpected error occurred: ${err.message || err}`, 'error');
  }
}