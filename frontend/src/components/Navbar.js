import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.navContainer}>
                <Link to="/dashboard" style={styles.logo}>Task Manager</Link>
                <div style={styles.navLinks}>
                    <span style={styles.username}>Welcome, {user.username} ({user.role})</span>
                    <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                </div>
            </div>
        </nav>
    );
};

const styles = {
    navbar: {
        backgroundColor: '#333',
        color: 'white',
        padding: '1rem',
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1000
    },
    navContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
    },
    logo: {
        color: 'white',
        textDecoration: 'none',
        fontSize: '20px',
        fontWeight: 'bold'
    },
    navLinks: {
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
    },
    username: {
        fontSize: '14px'
    },
    logoutBtn: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '5px 15px',
        borderRadius: '4px',
        cursor: 'pointer'
    }
};

export default Navbar;