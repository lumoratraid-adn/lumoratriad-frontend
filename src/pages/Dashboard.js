import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Dashboard.css";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    project_name: "",
    description: "",
    budget: "",
    timeline: "",
    demo_date: "",
    client_name: "",
    contact_number: "",
    reference_person: "",
    status: "pending",
  });

  const token = localStorage.getItem("access");

  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/");
  };

  const fetchProjects = useCallback(async () => {
    try {
      const response = await api.get("/api/projects/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sort projects by newest first
      setProjects(response.data.reverse());
    } catch (error) {
      console.log("Error fetching projects");
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/projects/${editingId}/`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post("/api/projects/", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      await fetchProjects();
      setFormData({
        project_name: "", description: "", budget: "", timeline: "",
        demo_date: "", client_name: "", contact_number: "", reference_person: "", status: "pending"
      });
      setEditingId(null);
    } catch (error) {
      alert("Error saving project");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await api.delete(`/api/projects/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProjects();
    } catch (error) {
      alert("Error deleting project");
    }
  };

  const handleEdit = (project) => {
    setFormData(project);
    setEditingId(project.id);
    // Scroll to form on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredProjects = projects.filter((project) =>
    project.project_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header fade-in">
        <div>
          <h1 className="dashboard-title">Lumora Portal</h1>
          <p className="dashboard-subtitle">Project & Client Management Suite</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Sign Out
        </button>
      </header>

      {/* Main Grid */}
      <div className="content-grid fade-in">

        {/* Left Column: Form */}
        <div className="form-section">
          <div className="form-card">
            <h3 className="form-title">
              {editingId ? "Edit Project" : "New Project"}
            </h3>
            <form onSubmit={handleSubmit} className="form-grid">

              <div>
                <input name="project_name" value={formData.project_name} onChange={handleChange} placeholder="Project Name" className="dashboard-input" required />
              </div>

              <div>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Project Description" rows="4" className="dashboard-input" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <p className="label-text">Budget</p>
                  <input name="budget" value={formData.budget} onChange={handleChange} placeholder="$0.00" className="dashboard-input" />
                </div>
                <div>
                  <p className="label-text">Timeline</p>
                  <input name="timeline" value={formData.timeline} onChange={handleChange} placeholder="e.g. 2 weeks" className="dashboard-input" />
                </div>
              </div>

              <div>
                <p className="label-text">Demo / Due Date</p>
                <input type="date" name="demo_date" value={formData.demo_date} onChange={handleChange} className="dashboard-input" />
              </div>

              <div>
                <p className="label-text">Client Details</p>
                <input name="client_name" value={formData.client_name} onChange={handleChange} placeholder="Client Name" className="dashboard-input" style={{ marginBottom: '10px' }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <input name="contact_number" value={formData.contact_number} onChange={handleChange} placeholder="Phone" className="dashboard-input" />
                  <input name="reference_person" value={formData.reference_person} onChange={handleChange} placeholder="Reference" className="dashboard-input" />
                </div>
              </div>

              <div>
                <p className="label-text">Project Status</p>
                <select name="status" value={formData.status} onChange={handleChange} className="dashboard-input">
                  <option value="pending">🟡 Pending</option>
                  <option value="ongoing">🔵 Ongoing</option>
                  <option value="completed">🟢 Completed</option>
                </select>
              </div>

              <button type="submit" className="primary-btn">
                {editingId ? "Update Project" : "Create Project"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setFormData({ project_name: "", description: "", budget: "", timeline: "", demo_date: "", client_name: "", contact_number: "", reference_person: "", status: "pending" }); }}
                  className="cancel-btn"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Projects List */}
        <div className="projects-section">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-bar"
            />
          </div>

          <div className="projects-grid">
            {filteredProjects.length === 0 ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "4rem", color: "var(--text-gray)", background: "var(--card-bg)", borderRadius: "var(--radius-lg)", border: "var(--glass-border)" }}>
                <h3>No projects found</h3>
                <p>Create a new project to get started.</p>
              </div>
            ) : (
              filteredProjects.map((project, index) => (
                <div key={project.id} className={`project-card fade-in stagger-${(index % 5) + 1}`}>
                  <div className="project-header">
                    <h4 className="project-title">{project.project_name}</h4>
                    <span className={`status-badge status-${project.status}`}>
                      {project.status}
                    </span>
                  </div>

                  <p className="project-desc">
                    {project.description || "No description provided."}
                  </p>

                  <div className="project-meta">
                    <div className="meta-item">📅 <span>{project.demo_date || "N/A"}</span></div>
                    <div className="meta-item">💰 <span>{project.budget ? `$${project.budget}` : "N/A"}</span></div>
                    <div className="meta-item">👤 <span>{project.client_name || "N/A"}</span></div>
                    <div className="meta-item">📞 <span>{project.contact_number || "N/A"}</span></div>
                  </div>

                  <div className="actions">
                    <button onClick={() => handleEdit(project)} className="action-btn btn-edit">
                      <span>✏️</span> Edit
                    </button>
                    <button onClick={() => handleDelete(project.id)} className="action-btn btn-delete">
                      <span>🗑️</span> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
