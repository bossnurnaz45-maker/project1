import './ErrorMessage.css';

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-container">
      <div className="error-icon">⚠</div>
      <h2 className="error-title">Ошибка загрузки</h2>
      <p className="error-message">{message}</p>
      <button className="error-retry" onClick={onRetry}>
        Повторить
      </button>
    </div>
  );
}

export default ErrorMessage;
