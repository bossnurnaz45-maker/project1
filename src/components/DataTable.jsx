import { useState, useMemo } from 'react';
import './DataTable.css';

const ITEMS_PER_PAGE = 5;

const COLUMN_KEYS = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Имя' },
  { key: 'username', label: 'Логин' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Телефон' },
  { key: 'website', label: 'Сайт' },
  { key: 'company', label: 'Компания' },
  { key: 'city', label: 'Город' },
];

function getCellValue(user, key) {
  switch (key) {
    case 'company':
      return user.company?.name ?? '';
    case 'city':
      return user.address?.city ?? '';
    default:
      return user[key] ?? '';
  }
}

function DataTable({
  users,
  searchTerm,
  onSearchChange,
  currentPage,
  onPageChange,
  onExportPdf,
  onOpenColumnSelector,
}) {
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return users;
    return users.filter((u) => u.name?.toLowerCase().includes(term));
  }, [users, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const visibleColumns = COLUMN_KEYS;

  return (
    <div className="data-table-wrapper">
      <div className="table-controls">
        <div className="input-group">
          <input
            type="text"
            className="input"
            placeholder=" "
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onPageChange(1);
            }}
            required
          />
          <label className="user-label">Поиск по имени</label>
        </div>
        <div className="table-actions">
          <button className="btn btn-secondary" onClick={onOpenColumnSelector} title="Выбор колонок для экспорта в PDF">
            Колонки для PDF
          </button>
          <button className="btn btn-primary" onClick={onExportPdf}>
            Скачать PDF
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {visibleColumns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id}>
                {visibleColumns.map((col) => (
                  <td key={col.key}>{getCellValue(user, col.key)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <p className="no-data">Нет данных для отображения</p>
      )}

      {filteredUsers.length > 0 && (
        <div className="pagination">
          <button
            className="btn btn-pagination"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Предыдущая
          </button>
          <span className="pagination-info">
            Страница {currentPage} из {totalPages} ({filteredUsers.length} записей)
          </span>
          <button
            className="btn btn-pagination"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Следующая
          </button>
        </div>
      )}
    </div>
  );
}

export default DataTable;
export { COLUMN_KEYS, getCellValue, ITEMS_PER_PAGE };
