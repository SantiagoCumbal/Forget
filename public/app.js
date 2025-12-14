let supabase;

// Initialize Supabase client with hardcoded values (from environment variables in Vercel)
async function initializeSupabase() {
  try {
    const SUPABASE_URL = 'https://oyxpjgjwhyzgywohwldd.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95eHBqZ2p3aHl6Z3l3b2h3bGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2ODE5ODMsImV4cCI6MjA4MTI1Nzk4M30.pa7FgzW6oSfdOS3CCQ32aAM02Xyedme6Rv_1onFj15Q';
    
    const { createClient } = window.supabase;
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase initialized');
    
    // Exchange code for session when redirected from email
    await exchangeCodeForSession();
  } catch (err) {
    console.error('Error initializing Supabase:', err);
    showError('Error al inicializar la autenticación: ' + err.message);
  }
}

// Exchange code for session when redirected from email
async function exchangeCodeForSession() {
  try {
    if (!supabase) {
      console.error('Supabase not initialized');
      return;
    }
    
    // Extract access_token and email from URL
    const url = new URL(window.location.href);
    const accessToken = url.searchParams.get('access_token');
    const email = url.searchParams.get('email');
    const type = url.searchParams.get('type');
    
    console.log('Access Token:', accessToken);
    console.log('Email:', email);
    console.log('Type:', type);
    
    if (!accessToken) {
      console.log('No access token - user can reset password manually');
      return;
    }
    
    // Store the token and email for later use
    window.resetToken = accessToken;
    window.resetEmail = email;
    console.log('Reset token and email stored');
    
  } catch (err) {
    console.error('Exception:', err);
  }
}

// Call on page load
window.addEventListener('load', initializeSupabase);

// Handle form submission
document.getElementById('resetForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const errorDiv = document.getElementById('error');
  const successDiv = document.getElementById('success');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const btnLoader = document.getElementById('btnLoader');
  
  // Reset messages
  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';
  
  // Validate passwords match
  if (password !== confirmPassword) {
    showError('Las contraseñas no coinciden');
    return;
  }
  
  // Validate password length
  if (password.length < 6) {
    showError('La contraseña debe tener al menos 6 caracteres');
    return;
  }
  
  // Show loading state
  submitBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoader.style.display = 'inline-block';
  
  try {
    // If we have a reset token and email, verify and update password
    if (window.resetToken && window.resetEmail) {
      // Verify OTP with email and token
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        type: 'recovery',
        token: window.resetToken,
        email: window.resetEmail
      });
      
      if (verifyError) {
        console.error('Verify error:', verifyError);
        showError('Error al verificar: ' + verifyError.message);
        return;
      }
      
      console.log('OTP verified:', verifyData);
      
      // If we got a session, set it
      if (verifyData.session) {
        const { error: sessionError } = await supabase.auth.setSession(verifyData.session);
        if (sessionError) {
          console.error('Session error:', sessionError);
        }
      }
      
      // Update password with the new session
      const { error } = await supabase.auth.updateUser({ password: password });
      
      if (error) {
        showError('Error al actualizar la contraseña: ' + error.message);
      } else {
        showSuccess('¡Contraseña actualizada correctamente! Puedes cerrar esta ventana.');
        document.getElementById('resetForm').reset();
        
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    } else {
      showError('No hay token. Por favor, intenta nuevamente con el enlace del email.');
    }
  } catch (err) {
    showError('Error: ' + err.message);
  } finally {
    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
  }
});

function showError(message) {
  const errorDiv = document.getElementById('error');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

function showSuccess(message) {
  const successDiv = document.getElementById('success');
  successDiv.textContent = message;
  successDiv.style.display = 'block';
}