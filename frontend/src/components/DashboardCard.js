import './DashboardCard.css';

function DashboardCard({ title, children }) {
    return (
        <div className="card">
            <h1>{title}</h1>
            {children}
        </div>
    );
}

export default DashboardCard;