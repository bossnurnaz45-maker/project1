import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchUsers } from '../api/users';
import { exportUsersToPdf } from '../utils/exportPdf';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import DataTable, { COLUMN_KEYS } from '../components/DataTable';
import ColumnSelector from '../components/ColumnSelector';
import './HomePage.css';

function HomePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedColumns, setSelectedColumns] = useState(
    () => COLUMN_KEYS.map((c) => c.key)
  );
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'API недоступно. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return users;
    return users.filter((u) => u.name?.toLowerCase().includes(term));
  }, [users, searchTerm]);

  const handleExportPdf = useCallback(async () => {
    try {
      await exportUsersToPdf(filteredUsers, selectedColumns);
    } catch (err) {
      console.error('Ошибка экспорта PDF:', err);
    }
  }, [filteredUsers, selectedColumns]);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={loadUsers} />;

  return (
    <div className="home-page">
      <header className="page-header">
        <h1>Пользователи</h1>
      </header>
      <main className="page-main">
        <DataTable
          users={users}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onExportPdf={handleExportPdf}
          onOpenColumnSelector={() => setShowColumnSelector(true)}
        />
      </main>
      {showColumnSelector && (
        <ColumnSelector
          columns={COLUMN_KEYS}
          selectedColumns={selectedColumns}
          onSave={setSelectedColumns}
          onClose={() => setShowColumnSelector(false)}
        />
      )}
    </div>
  );
}

export default HomePage;
