import './Loader.css';

function Loader() {
  return (
    <div className="loader-container">
      <div className="loader-spinner"></div>
      <p className="loader-text">Загрузка данных...</p>
    </div>
  );
}

export default Loader;
