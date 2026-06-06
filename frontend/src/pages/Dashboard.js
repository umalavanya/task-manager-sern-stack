import React, { useState, useEffect } from 'react';
import API from '../services/api';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium',
        assigned_to: '',
        due_date: ''
    });
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isManager = user.role === 'manager';

    // Fetch tasks on component mount
    useEffect(() => {
        fetchTasks();
        if (isManager) {
            fetchUsers();
        }
    }, [] );

    const fetchTasks = async () => {
        try {
            const response = await API.get('/tasks');
            setTasks(response.data.tasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await API.get('/users');
            setUsers(response.data.users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await API.post('/tasks', newTask);
            setShowForm(false);
            setNewTask({
                title: '',
                description: '',
                priority: 'medium',
                assigned_to: '',
                due_date: ''
            });
            fetchTasks();
            alert('Task created successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating task');
        }
    };

    const handleUpdateStatus = async (taskId, currentStatus) => {
        const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
        try {
            await API.put(`/tasks/${taskId}/status`, { status: newStatus });
            fetchTasks();
            alert(`Task marked as ${newStatus}!`);
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {

                await API.delete(`/tasks/${taskId}`);
                fetchTasks();
                alert('Task deleted successfully!');
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting task');
            }
        }
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            
            case 'high': return '#dc3545';
            case 'medium': return '#ffc107';
            case 'low': return '#28a745';
            default: return '#6c757d';
        }
    };

    if (loading) {
        return <div style={styles.loading}>Loading tasks...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Task Dashboard</h1>
                {isManager && (
                    <button 
                        onClick={() => setShowForm(!showForm)} 
                        style={styles.addButton}
                    >
                        {showForm ? 'Cancel' : '+ Add New Task'}
                    </button>
                )}
            </div>

            {isManager && showForm && (
                <div style={styles.formContainer}>
                    <h3>Create New Task</h3>
                    <form onSubmit={handleCreateTask}>
                        <input
                            type="text"
                            placeholder="Task Title *"
                            value={newTask.title}
                            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                            style={styles.input}
                            required
                        />
                        <textarea
                            placeholder="Description"
                            value={newTask.description}
                            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                            style={styles.textarea}
                            rows="3"
                        />
                        <select
                            value={newTask.priority}
                            onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                            style={styles.input}
                        >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                        </select>
                        <select
                            value={newTask.assigned_to}
                            onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})}
                            style={styles.input}
                            required
                        >
                            <option value="">Assign to...</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.username} ({user.role})
                                </option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={newTask.due_date}
                            onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                            style={styles.input}
                        />
                        <button type="submit" style={styles.submitButton}>Create Task</button>
                    </form>
                </div>
            )}

            <div style={styles.taskList}>
                {tasks.length === 0 ? (
                    <p style={styles.noTasks}>No tasks found. {isManager && 'Create your first task!'}</p>
                ) : (
                    tasks.map(task => (
                        <div key={task.id} style={styles.taskCard}>
                            <div style={styles.taskHeader}>
                                <h3 style={styles.taskTitle}>{task.title}</h3>
                                <span style={{
                                    ...styles.priority,
                                    backgroundColor: getPriorityColor(task.priority)
                                }}>
                                    {task.priority}
                                </span>
                            </div>
                            
                            {task.description && (
                                <p style={styles.taskDescription}>{task.description}</p>
                            )}
                            
                            <div style={styles.taskDetails}>
                                <span><strong>Assigned to:</strong> {task.assigned_to_name || 'Unassigned'}</span>
                                <span><strong>Created by:</strong> {task.assigned_by_name || 'N/A'}</span>
                                {task.due_date && (
                                    <span><strong>Due:</strong> {new Date(task.due_date).toLocaleDateString()}</span>
                                )}
                                <span style={{
                                    ...styles.status,
                                    color: task.status === 'completed' ? '#28a745' : '#ffc107'
                                }}>
                                    <strong>Status:</strong> {task.status}
                                </span>
                            </div>
                            
                            <div style={styles.taskActions}>
                                {(isManager || task.assigned_to === user.id) && (
                                    <button
                                        onClick={() => handleUpdateStatus(task.id, task.status)}
                                        style={{
                                            ...styles.statusButton,
                                            backgroundColor: task.status === 'completed' ? '#ffc107' : '#28a745'
                                        }}
                                    >
                                        {task.status === 'completed' ? 'Reopen Task' : 'Mark Complete'}
                                    </button>
                                )}
                                
                                {isManager && (
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        style={styles.deleteButton}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '80px 20px 20px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
    },
    addButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px'
    },
    formContainer: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    input: {
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
    },
    textarea: {
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        fontFamily: 'inherit'
    },
    submitButton: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        width: '100%',
        marginTop: '10px'
    },
    taskList: {
        display: 'grid',
        gap: '20px'
    },
    taskCard: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    taskHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
    },
    taskTitle: {
        margin: 0,
        fontSize: '18px'
    },
    priority: {
        padding: '4px 12px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    taskDescription: {
        color: '#666',
        marginBottom: '15px',
        lineHeight: '1.5'
    },
    taskDetails: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '10px',
        marginBottom: '15px',
        fontSize: '14px',
        borderTop: '1px solid #eee',
        paddingTop: '15px'
    },
    status: {
        fontWeight: '500'
    },
    taskActions: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end'
    },
    statusButton: {
        padding: '6px 12px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        color: 'white',
        fontSize: '14px'
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    loading: {
        textAlign: 'center',
        padding: '50px',
        fontSize: '18px'
    },
    noTasks: {
        textAlign: 'center',
        padding: '50px',
        color: '#666',
        fontSize: '16px'
    }
};

export default Dashboard;