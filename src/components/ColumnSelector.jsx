import { useState, useEffect } from 'react';
import './ColumnSelector.css';

function ColumnSelector({ columns, selectedColumns, onSave, onClose }) {
  const [localSelected, setLocalSelected] = useState(selectedColumns);

  useEffect(() => {
    setLocalSelected(selectedColumns);
  }, [selectedColumns]);

  const toggle = (key) => {
    setLocalSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectAll = () => setLocalSelected(columns.map((c) => c.key));
  const deselectAll = () => setLocalSelected([]);

  const handleSave = () => {
    onSave(localSelected.length > 0 ? localSelected : columns.map((c) => c.key));
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Колонки для экспорта в PDF</h3>
        <div className="modal-actions-top">
          <button type="button" className="btn-link" onClick={selectAll}>
            Выбрать все
          </button>
          <button type="button" className="btn-link" onClick={deselectAll}>
            Снять все
          </button>
        </div>
        <div className="column-list">
          {columns.map((col) => (
            <label key={col.key} className="column-item">
              <input
                type="checkbox"
                checked={localSelected.includes(col.key)}
                onChange={() => toggle(col.key)}
              />
              <span>{col.label}</span>
            </label>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Отмена
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}

export default ColumnSelector;
