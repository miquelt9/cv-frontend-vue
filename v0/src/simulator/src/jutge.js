import { jutge_api_client } from './jutge_api_client.js';
import { verilog } from './verilog.js';
import { showMessage } from '#/simulator/src/utils'


/**
 * Prompt for login, export circuit to Verilog, and submit to Jutge.
 */
export async function sendToJutge() {
  try {
    // 1. Prompt user for email and password
    const email = prompt('Please enter your email:');
    const password = prompt('Please enter your password:');
    if (!email || !password) {
      alert('Email and password are required.');
      return;
    }

    // 2. Authenticate
    const { token, error: loginError } = await jutge_api_client.auth.login({ email, password });
    console.log('Login response:', { token, loginError });
    if (loginError || token == "") {
      alert(`Login failed: ${loginError}`);
      return;
    }

    jutge_api_client.meta = { token };

    // 4. Export circuit as Verilog code
    const verilogCode = verilog.exportVerilog();
    console.log('Exported Verilog:', verilogCode);

    // 5. Submit solution
    const submissionResult = await jutge_api_client.student.submissions.submit({
      problem_id: 'X64345_en',
      compiler_id: 'Circuits',
      code: verilogCode,
      annotation: ''
    });
    console.log('Submission Result:', submissionResult);
    if (submissionResult.error) {
      alert(`Submission error: ${submissionResult.error}`);
    } else {
      showMessage('Circuit was successfully submitted to https://www.jutge.org')
    }

  } catch (err) {
    console.error('Error in sendToJutge:', err);
    alert(`An error occurred: ${err.message || err}`);
  }
}

