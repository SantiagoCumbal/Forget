let supabase;

async function initializeSupabase() {
  const SUPABASE_URL = 'https://oyxpjgjwhyzgywohwldd.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95eHBqZ2p3aHl6Z3l3b2h3bGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2ODE5ODMsImV4cCI6MjA4MTI1Nzk4M30.pa7FgzW6oSfdOS3CCQ32aAM02Xyedme6Rv_1onFj15Q';

  const { createClient } = window.supabase;
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 👇 ESTO ES LO IMPORTANTE
  const { error } = await supabase.auth.getSessionFromUrl();

  if (error) {
    showError('Link inválido o expirado');
  }
}

window.addEventListener('load', initializeSupabase);

document.getElementById('resetForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    showError('Las contraseñas no coinciden');
    return;
  }

  if (password.length < 6) {
    showError('Mínimo 6 caracteres');
    return;
  }

  const { error } = await supabase.auth.updateUser({
    password
  });

  if (error) {
    showError(error.message);
  } else {
    showSuccess('Contraseña actualizada correctamente');
    document.getElementById('resetForm').reset();
  }
});
