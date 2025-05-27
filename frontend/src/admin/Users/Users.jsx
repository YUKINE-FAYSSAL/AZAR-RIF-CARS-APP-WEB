import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(1);
  const usersPerPage = 8;
  const [password, setPassword] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchUsers();
    fetchStats();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/admin/users`, {
      withCredentials: true
    })
      .then(res => {
      console.log('Users:', res.data); // <-- جرب شنو كيرجع
      setUsers(res.data);
    })
      .catch(err => console.error('Error loading users:', err))
      .finally(() => setLoading(false));
  };

  const fetchStats = () => {
    axios.get(`${API_BASE_URL}/api/admin/users/stats`, {
      withCredentials: true
    })
      .then(res => setStats(res.data))
      .catch(err => console.error('Error loading stats:', err));
  };

  const requestRoleChange = (user) => {
    setCurrentUser(user);
    setNewRole(user.role === 'admin' ? 'user' : 'admin');
    setShowRoleModal(true);
  };

  const confirmRoleChange = () => {
    if (!password) {
      alert('Please enter your admin password');
      return;
    }

    axios.post(`${API_BASE_URL}/api/admin/verify-password`,
      { password },
      { withCredentials: true }
    )
      .then(response => {
        if (response.data.valid) {
          performRoleChange();
        } else {
          alert('Incorrect admin password');
        }
      })
      .catch(err => {
        console.error('Password verification failed:', err);
        alert('Error verifying password');
      });
  };

  const performRoleChange = () => {
    axios.put(`${API_BASE_URL}/api/admin/users/${encodeURIComponent(currentUser.email)}/role`,
      { role: newRole },
      { withCredentials: true }
    )
      .then(() => {
        setUsers(prev => prev.map(u =>
          u.email === currentUser.email ? { ...u, role: newRole } : u
        ));
        setShowRoleModal(false);
        setPassword('');
        alert(`Role changed successfully to ${newRole}`);
      })
      .catch(err => {
        console.error('Role change failed:', err);
        alert('Failed to change role');
      });
  };

  const deleteUser = (email) => {
    confirmAlert({
      title: 'Confirm deletion',
      message: `Are you sure you want to delete ${email}?`,
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            axios.delete(`${API_BASE_URL}/api/admin/users/${encodeURIComponent(email)}`)
              .then(() => setUsers(prev => prev.filter(u => u.email !== email)))
              .catch(err => console.error('Error deleting user:', err));
          }
        },
        {
          label: 'No',
          onClick: () => { }
        }
      ]
    });
  };

  // -- Search/filter logic (fullName, email, phone)
  const filtered = users
    .filter(u => {
      const name = u.fullName ? u.fullName.toLowerCase() : '';
      const email = u.email ? u.email.toLowerCase() : '';
      const phone = u.phone ? String(u.phone).toLowerCase() : '';
      const term = searchTerm.toLowerCase();
      return name.includes(term) || email.includes(term) || phone.includes(term);
    })
    .sort((a, b) => (a.fullName || a.email || '').localeCompare(b.fullName || b.email || ''));

  const paginated = filtered.slice((page - 1) * usersPerPage, page * usersPerPage);
  const totalPages = Math.ceil(filtered.length / usersPerPage);

  const RoleBadge = ({ role }) => (
    <span className={`role-badge ${role}`}>
      {role === 'admin' ? '👑 Admin' : '👤 User'}
    </span>
  );

  return (
    <div className="users-admin-container">
      <div className="users-header">
        <div className="header-left">
          <h2><i className="fas fa-users-cog"></i> User Management</h2>
          <div className="stats-summary">
            <span className="stat-item">
              <span className="stat-number">{stats.admins || 0}</span>
              <span className="stat-label">Admins</span>
            </span>
            <span className="stat-item">
              <span className="stat-number">{stats.users || 0}</span>
              <span className="stat-label">Users</span>
            </span>
            <span className="stat-item">
              <span className="stat-number">{stats.newUsersLast30Days || 0}</span>
              <span className="stat-label">New (30d)</span>
            </span>
          </div>
        </div>
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Nom complet</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="loading-row">
                  <div className="spinner"></div>
                  Loading users...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-row">
                  No users found
                </td>
              </tr>
            ) : (
              paginated.map(user => (
                <tr key={user.email}>
                  <td>
                    <div className="user-info">
                      <span className="full-name">{user.fullName || user.full_name || user.email || '-'}</span>
                    </div>
                  </td>
                  <td>{user.email || '-'}</td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    <RoleBadge role={user.role} />
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-change-role"
                        onClick={() => requestRoleChange(user)}
                        disabled={currentUser?.email === user.email}
                      >
                        <i className="fas fa-user-shield"></i> Change Role
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => deleteUser(user.email)}
                        disabled={currentUser?.email === user.email}
                      >
                        <i className="fas fa-trash-alt"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {showRoleModal && (
        <div className="modal-overlay">
          <div className="role-change-modal">
            <h3>Change User Role</h3>
            <p>
              You are changing role for <strong>{currentUser?.fullName || currentUser?.email}</strong> from{' '}
              <span className={`role-badge ${currentUser?.role}`}>
                {currentUser?.role}
              </span>{' '}
              to{' '}
              <span className={`role-badge ${newRole}`}>
                {newRole}
              </span>
            </p>
            <div className="form-group">
              <label>Confirm with Admin Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your admin password"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => {
                setShowRoleModal(false);
                setPassword('');
              }}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={confirmRoleChange}>
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
