import { useNavigate } from "react-router-dom";
import "./CommunityOneDashboard.css";

export default function CommunityOneDashboard() {
  const navigate = useNavigate();

  const services = [
    {
      title: "SES",
      description: "Simple Employment Services",
      path: "/communityone/ses",
      icon: "💼",
    },
    {
      title: "SHS",
      description: "Simple Housing Services",
      path: "/communityone/shs",
      icon: "🏠",
    },
    {
      title: "XChange",
      description: "Community Marketplace",
      path: "/communityone/xchange",
      icon: "🔁",
    },
    {
      title: "Requests",
      description: "Community Requests",
      path: "/communityone/requests",
      icon: "📣",
    },
    {
      title: "Responses",
      description: "My Responses",
      path: "/communityone/responses",
      icon: "📨",
    },
    {
      title: "Transactions",
      description: "Completed Transactions",
      path: "/communityone/transactions",
      icon: "🤝",
    },
  ];

  return (
    <div className="co-dashboard">
      <h1>Community One</h1>

      <p className="co-subtitle">
        Edge Services Dashboard
      </p>

      <div className="co-dashboard-grid">
        {services.map((service) => (
          <button
            key={service.path}
            className="co-service-card"
            onClick={() => navigate(service.path)}
          >
            <div className="co-service-icon">
              {service.icon}
            </div>

            <h3>{service.title}</h3>

            <p>{service.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}