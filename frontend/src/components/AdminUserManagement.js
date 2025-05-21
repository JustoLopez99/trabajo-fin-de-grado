import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios'; // Asegúrate de tener axios instalado: npm install axios

// Estilos básicos (puedes moverlos a un archivo .css o usar Tailwind CSS si lo prefieres)
const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
  },
  th: {
    borderBottom: '2px solid #ddd',
    padding: '12px 15px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
    color: '#333',
  },
  td: {
    borderBottom: '1px solid #eee',
    padding: '12px 15px',
  },
  button: {
    marginRight: '8px',
    padding: '8px 12px',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '0.9em',
    transition: 'background-color 0.2s ease',
  },
  editButton: {
    backgroundColor: '#5cb85c', // Verde
    color: 'white',
  },
  deleteButton: {
    backgroundColor: '#d9534f', // Rojo
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#0275d8', // Azul
    color: 'white',
    marginTop: '15px',
  },
  cancelButton: {
    backgroundColor: '#6c757d', // Gris
    color: 'white',
    marginLeft: '10px',
    marginTop: '15px',
  },
  formContainer: {
    border: '1px solid #ddd',
    padding: '25px',
    marginBottom: '25px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  formInput: {
    display: 'block',
    width: 'calc(100% - 20px)',
    padding: '10px',
    margin: '8px 0 15px 0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1em',
  },
  formLabel: {
    fontWeight: 'bold',
    marginTop: '10px',
    display: 'block',
    color: '#555',
  },
  error: {
    color: '#d9534f',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    padding: '10px',
    borderRadius: '4px',
    marginTop: '10px',
    marginBottom: '15px',
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.2em',
    marginTop: '30px',
    color: '#555',
  },
  header: {
    color: '#333',
    borderBottom: '2px solid #0275d8',
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  actionCell: {
    minWidth: '150px', // Para asegurar espacio para los botones
    textAlign: 'center',
  }
};

function AdminUserManagement() {
  // Obtiene datos del contexto del Outlet, como información del administrador actual.
  const { fullName, userRole, email: currentAdminEmail } = useOutletContext() || {};
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null); // Almacena el usuario que se está editando.

  // URL base de la API para las operaciones de usuarios.
  // Asegúrate de que esta URL sea correcta para tu backend.
  const API_URL = '/api/users';

  // Función para obtener el token de autenticación desde localStorage.
  const getToken = () => localStorage.getItem('token');

  // Función para cargar la lista de usuarios desde la API.
  // useCallback se usa para memorizar la función y evitar recreaciones innecesarias.
  const fetchUsers = useCallback(async () => {
    // Solo los administradores pueden cargar usuarios.
    if (userRole !== 'admin') {
        setError("Acceso denegado. Se requieren permisos de administrador.");
        return;
    }
    setIsLoading(true);
    setError('');
    try {
      const token = getToken();
      if (!token) {
        setError("No autenticado. Por favor, inicia sesión.");
        setIsLoading(false);
        return;
      }
      // Realiza la petición GET a la API para obtener los usuarios.
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

    
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        // Si la respuesta no es un array, se establece users como array vacío y se muestra un error.
        setUsers([]);
        setError('La respuesta de la API no contenía una lista de usuarios válida.');
        console.error("Respuesta inesperada de la API:", response.data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || 'Error al cargar usuarios. Inténtalo de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  }, [userRole, API_URL]); // Dependencias de useCallback

  // useEffect para cargar los usuarios cuando el componente se monta o fetchUsers cambia.
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Función para manejar la eliminación de un usuario.
  const handleDelete = async (userId, userUsername) => {
    // Se utiliza un modal nativo para la confirmación. Considerar un modal personalizado para mejor UX.
    // NO USAR window.confirm en producción si se busca una UI más integrada.
    // Esta es una simplificación. Para una mejor UX, usar un componente modal.
    const confirmDelete = window.prompt(`Para confirmar la eliminación, escribe el nombre de usuario "${userUsername}":`);
    if (confirmDelete === userUsername) {
        setIsLoading(true);
        setError('');
        try {
            const token = getToken();
            await axios.delete(`${API_URL}/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Actualiza el estado local eliminando el usuario.
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            // NO USAR alert en producción. Usar notificaciones o toasts.
            // alert(`Usuario ${userUsername} eliminado.`);
            // En su lugar, podrías tener un estado para mensajes de éxito:
            // setSuccessMessage(`Usuario ${userUsername} eliminado.`);
        } catch (err) {
            console.error("Error deleting user:", err);
            setError(err.response?.data?.message || 'Error al eliminar usuario.');
        } finally {
            setIsLoading(false);
        }
    } else if (confirmDelete !== null) { // Si el usuario escribió algo pero no coincide
        setError("El nombre de usuario no coincide. Eliminación cancelada.");
    }
  };

  // Función para activar el modo de edición para un usuario.
  const handleEdit = (user) => {
    setEditingUser({ ...user }); // Clona el objeto usuario para evitar mutaciones directas.
    setError(''); // Limpia errores previos.
  };

  // Función para guardar los cambios de un usuario editado.
  const handleSaveEdit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario.
    if (!editingUser) return;

    // Validaciones básicas en el frontend.
    if (!editingUser.email || !editingUser.first_name || !editingUser.last_name || !editingUser.role) {
        setError("Todos los campos (Email, Nombre, Apellido, Rol) son obligatorios.");
        return;
    }
    if (!['admin', 'client'].includes(editingUser.role)) {
        setError('Rol inválido. Debe ser "admin" o "client".');
        return;
    }
    // Validación de formato de email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editingUser.email)) {
        setError('Por favor, introduce un correo electrónico válido.');
        return;
    }


    setIsLoading(true);
    setError('');
    try {
      const token = getToken();
      const { id, username, ...updateData } = editingUser;
      const payload = {
        email: updateData.email,
        first_name: updateData.first_name,
        last_name: updateData.last_name,
        role: updateData.role,
      };

      // Realiza la petición PUT a la API para actualizar el usuario.
      const response = await axios.put(`${API_URL}/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Actualiza el estado local con los datos del usuario modificado.
      setUsers(users.map(user => (user.id === id ? response.data.user : user)));
      setEditingUser(null); // Cierra el formulario de edición.
      // alert(`Usuario ${response.data.user.username} actualizado.`); // Reemplazar con notificación
    } catch (err) {
      console.error("Error updating user:", err);
      setError(err.response?.data?.message || 'Error al actualizar usuario.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cancelar la edición y cerrar el formulario.
  const handleCancelEdit = () => {
    setEditingUser(null);
    setError('');
  };

  // Función para manejar los cambios en los inputs del formulario de edición.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingUser(prev => ({ ...prev, [name]: value }));
  };

  // Si el usuario no es administrador, muestra un mensaje de acceso denegado.
  if (userRole !== 'admin') {
    return (
      <div style={styles.container}>
        <h2 style={styles.header}>Acceso Denegado</h2>
        <p>Esta sección es solo para administradores.</p>
      </div>
    );
  }

  // Muestra un indicador de carga mientras se obtienen los datos iniciales.
  if (isLoading && !editingUser && users.length === 0) {
    return <div style={styles.loading}>Cargando usuarios...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Gestión de Usuarios (Admin: {fullName || 'N/A'})</h2>
      {error && <p style={styles.error}>{error}</p>}

      {/* Formulario de edición: se muestra si editingUser no es null */}
      {editingUser && (
        <div style={styles.formContainer}>
          <form onSubmit={handleSaveEdit}>
            <h3>Editando Usuario: {editingUser.username} (ID: {editingUser.id})</h3>
            
            <label htmlFor="email" style={styles.formLabel}>Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              style={styles.formInput}
              value={editingUser.email}
              onChange={handleInputChange}
              required
            />
            
            <label htmlFor="first_name" style={styles.formLabel}>Nombre:</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              style={styles.formInput}
              value={editingUser.first_name}
              onChange={handleInputChange}
              required
            />
            
            <label htmlFor="last_name" style={styles.formLabel}>Apellido:</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              style={styles.formInput}
              value={editingUser.last_name}
              onChange={handleInputChange}
              required
            />
            
            <label htmlFor="role" style={styles.formLabel}>Rol:</label>
            <select
              id="role"
              name="role"
              style={styles.formInput}
              value={editingUser.role}
              onChange={handleInputChange}
            >
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
            
            <button type="submit" style={{...styles.button, ...styles.saveButton}} disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button type="button" onClick={handleCancelEdit} style={{...styles.button, ...styles.cancelButton}} disabled={isLoading}>
              Cancelar
            </button>
          </form>
        </div>
      )}

      {/* Tabla de usuarios: se muestra si no se está editando un usuario */}
      {!editingUser && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Username</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Apellido</th>
              <th style={styles.th}>Rol</th>
              <th style={{...styles.th, ...styles.actionCell}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map(user => (
              <tr key={user.id}>
                <td style={styles.td}>{user.username}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.first_name}</td>
                <td style={styles.td}>{user.last_name}</td>
                <td style={styles.td}>{user.role}</td>
                <td style={{...styles.td, ...styles.actionCell}}>
                  <button
                    onClick={() => handleEdit(user)}
                    style={{...styles.button, ...styles.editButton}}
                    disabled={isLoading}
                  >
                    Editar
                  </button>
                  {/* Evita que el admin actual se elimine a sí mismo */}
                  {user.email !== currentAdminEmail && (
                    <button
                      onClick={() => handleDelete(user.id, user.username)}
                      style={{...styles.button, ...styles.deleteButton}}
                      disabled={isLoading}
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{...styles.td, textAlign: 'center'}}>No hay usuarios para mostrar.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      {/* Indicador de carga general para operaciones en curso */}
       {isLoading && (editingUser || users.length > 0) && <p style={styles.loading}>Procesando...</p>}
    </div>
  );
}

export default AdminUserManagement;
