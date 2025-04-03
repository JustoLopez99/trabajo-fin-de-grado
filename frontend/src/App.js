import React from 'react';
import './App.css';
import Datos from './Datos';  // Importa el componente Datos que creaste

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Mi Aplicación de Marketing Digital</h1> {/* Título de tu aplicación */}
        <p>Bienvenido al sistema de gestión de campañas de marketing.</p>
      </header>

      <main>
        <Datos />  {/* Aquí insertamos el componente que consulta el backend */}
      </main>
    </div>
  );
}

export default App;
