import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Dashboard.css";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list"); // 'list' or 'create' for mobile
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    project_name: "", description: "", budget: "", timeline: "",
    demo_date: "", client_name: "", contact_number: "", reference_person: "", status: "pending",
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
      setProjects(response.data.reverse());
    } catch (error) {
      console.log("Error fetching projects");
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/projects/${editingId}/`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await api.post("/api/projects/", formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      await fetchProjects();
      resetForm();
      setActiveTab("list"); // Switch back to list after save
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      alert("Error saving project");
    }
  };

  const resetForm = () => {
    setFormData({ project_name: "", description: "", budget: "", timeline: "", demo_date: "", client_name: "", contact_number: "", reference_person: "", status: "pending" });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`/api/projects/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      fetchProjects();
    } catch (error) {
      alert("Error deleting");
    }
  };

  const handleEdit = (project) => {
    setFormData(project);
    setEditingId(project.id);
    setActiveTab("create"); // Switch to form tab
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredProjects = projects.filter((project) =>
    project.project_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="brand-section">
          <h1>Lumora Portal</h1>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Sign Out
        </button>
      </header>

      {/* Mobile Tabs */}
      <div className="mobile-tabs">
        <button
          className={`tab-btn ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          📂 Projects
        </button>
        <button
          className={`tab-btn ${activeTab === "create" ? "active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          {editingId ? "✏️ Edit Project" : "➕ Create New"}
        </button>
      </div>

      <div className="content-grid">

        {/* FORM SECTION (Visible if tab='create' or desktop) */}
        <div className="view-container form-section" style={{ display: activeTab === 'create' ? 'block' : 'none' }}>
          <div className="form-card">
            <h3 className="form-title">{editingId ? "Edit Project" : "New Project Details"}</h3>

            <form onSubmit={handleSubmit} className="form-grid">

              <div>
                <label className="label-text">Project Name</label>
                <input name="project_name" value={formData.project_name} onChange={handleChange} className="dashboard-input" required />
              </div>

              <div>
                <label className="label-text">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="dashboard-input" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="label-text">Budget</label>
                  <input name="budget" value={formData.budget} onChange={handleChange} placeholder="$" className="dashboard-input" />
                </div>
                <div>
                  <label className="label-text">Timeline</label>
                  <input name="timeline" value={formData.timeline} onChange={handleChange} className="dashboard-input" />
                </div>
              </div>

              <div>
                <label className="label-text">Due Date</label>
                <input type="date" name="demo_date" value={formData.demo_date} onChange={handleChange} className="dashboard-input" />
              </div>

              <div>
                <label className="label-text">Client</label>
                <input name="client_name" value={formData.client_name} onChange={handleChange} className="dashboard-input" style={{ marginBottom: '10px' }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <input name="contact_number" value={formData.contact_number} onChange={handleChange} placeholder="Phone" className="dashboard-input" />
                  <input name="reference_person" value={formData.reference_person} onChange={handleChange} placeholder="Ref" className="dashboard-input" />
                </div>
              </div>

              <div>
                <label className="label-text">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="dashboard-input">
                  <option value="pending">Pending</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <button type="submit" className="primary-btn">
                {editingId ? "Update Project" : "Save Project"}
              </button>

              {editingId && (
                <button type="button" onClick={() => { resetForm(); setActiveTab("list"); }} className="cancel-btn">
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>

        {/* LIST SECTION (Visible if tab='list' or desktop) */}
        <div className="view-container list-section" style={{ display: activeTab === 'list' ? 'block' : 'none' }}>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />

          <div className="projects-grid">
            {filteredProjects.length === 0 ? (
              <p style={{ textAlign: "center", gridColumn: "1/-1", color: "var(--text-muted)", marginTop: "2rem" }}>No projects found.</p>
            ) : (
              filteredProjects.map((project) => (
                <div key={project.id} className="project-card">
                  <div className="project-header">
                    <h4 className="project-title">{project.project_name}</h4>
                    <span className={`status-badge status-${project.status}`}>
                      {project.status}
                    </span>
                  </div>

                  <p className="project-desc">
                    {project.description || "No description."}
                  </p>

                  <div className="project-meta">
                    <div>📅 {project.demo_date || "-"}</div>
                    <div>💰 {project.budget ? `$${project.budget}` : "-"}</div>
                    <div>👤 {project.client_name || "-"}</div>
                    <div>📞 {project.contact_number || "-"}</div>
                  </div>

                  <div className="actions">
                    <button onClick={() => handleEdit(project)} className="action-btn btn-edit">Edit</button>
                    <button onClick={() => handleDelete(project.id)} className="action-btn btn-delete">Delete</button>
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
