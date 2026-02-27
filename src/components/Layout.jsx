import { Outlet } from 'react-router-dom';
import './Layout.css';

function Layout() {
  return (
    <div className="layout">
      <div className="layout-content">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
